const express = require('express');

const router = express.Router();
const Member = require('../models/Member');
const Team = require('../models/Team');
const Certificate = require('../models/Certificate');
const { certificateStorage, cloudinary } = require('../config/cloudinary');
const { getEnvironmentConfig } = require('../config/environment');
const { createLoginLimiter } = require('../config/rate-limit');
const { memberAuth } = require('../middleware/member-auth');
const {
  CertificateUploadStorageError,
  createCertificateUploadMiddleware,
  sendCertificateUploadError,
} = require('../middleware/certificate-upload');
const {
  assertValidId,
  MemberRequestValidationError,
  sanitizeCertificateMetadata,
  sanitizeMemberActivation,
  sanitizeMemberCredentials,
  sanitizeMemberProfileUpdate,
} = require('./member.validation');
const {
  hashActivationToken,
  hashMemberPassword,
  verifyMemberPassword,
  createMemberToken,
} = require('../services/member-auth');
const { PUBLIC_TEAM_PROJECTION, serializePublicTeamMember } = require('../validation/team-public');
const { serializeCertificate } = require('../validation/certificate-public');
const { getCertificateDestroyOptions } = require('../services/certificate-storage');

const loginLimiter = createLoginLimiter();
const certificateUpload = createCertificateUploadMiddleware(certificateStorage);

const maybeSelect = (query, fields) => (
  query && typeof query.select === 'function' ? query.select(fields) : query
);

const findMemberWithPassword = (filter) => maybeSelect(Member.findOne(filter), '+passwordHash');

const accountPayload = (member, team) => ({
  id: member?._id,
  username: member?.username,
  status: member?.status,
  profile: team ? serializePublicTeamMember(team) : null,
});

const certificatePayload = (certificate, includeDownloadUrl = true) => serializeCertificate(certificate, {
  cloudinary,
  includeDownloadUrl,
});

const cleanupCertificateAsset = async (file) => {
  const publicId = file?.public_id || file?.filename;
  if (!publicId || !cloudinary?.uploader?.destroy) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: file.resource_type || 'auto',
      type: 'authenticated',
    });
  } catch (error) {
    // The original request error remains the client response. This log is
    // intentionally metadata-only so provider details and credentials never
    // reach the response or logs.
    console.error(JSON.stringify({ event: 'member_certificate_cleanup_failed', errorClass: error?.constructor?.name || typeof error }));
  }
};

const handleValidationError = (res, error) => {
  if (error instanceof MemberRequestValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  return false;
};

// This is an administrator-controlled activation flow. There is no public
// registration endpoint, so a username cannot be attached to an existing
// Team record by an unauthenticated caller.
router.post('/activate', loginLimiter, async (req, res) => {
  try {
    const { token, password } = sanitizeMemberActivation(req.body);
    const passwordHash = await hashMemberPassword(password);
    const member = await Member.findOneAndUpdate(
      {
        activationTokenHash: hashActivationToken(token),
        status: 'pending',
        activationExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash, status: 'active', tokenVersion: 0 },
        $unset: { activationTokenHash: 1, activationExpiresAt: 1 },
      },
      { new: true, runValidators: true },
    );

    if (!member) return res.status(400).json({ message: 'Activation link is invalid or expired' });
    return res.json({ message: 'Member account activated' });
  } catch (error) {
    if (handleValidationError(res, error)) return undefined;
    return res.status(500).json({ message: 'Unable to activate member account' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { jwtSecret } = getEnvironmentConfig();
    if (!jwtSecret) return res.status(503).json({ message: 'Authentication is not configured' });

    const { username, password } = sanitizeMemberCredentials(req.body);
    const member = await findMemberWithPassword({ username });
    const validPassword = member ? await verifyMemberPassword(password, member.passwordHash) : false;

    if (!member || member.status !== 'active' || !validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createMemberToken({
      memberId: member._id,
      teamId: member.teamId,
      tokenVersion: member.tokenVersion,
    }, jwtSecret);
    return res.json({ token });
  } catch (error) {
    if (handleValidationError(res, error)) return undefined;
    return res.status(500).json({ message: 'Server error during member login' });
  }
});

router.use(memberAuth);

router.get('/me', async (req, res) => {
  try {
    const team = await Team.findById(req.member.teamId, PUBLIC_TEAM_PROJECTION);
    return res.json(accountPayload(req.member, team));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch member account' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await Member.findByIdAndUpdate(req.member._id, { $inc: { tokenVersion: 1 } }, { new: true });
    return res.json({ message: 'Member signed out' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to sign out member' });
  }
});

router.patch('/profile', async (req, res) => {
  try {
    const updates = sanitizeMemberProfileUpdate(req.body);
    const team = await Team.findOneAndUpdate(
      { _id: req.member.teamId },
      updates,
      { new: true, runValidators: true },
    );
    if (!team) return res.status(404).json({ message: 'Member profile not found' });
    return res.json({ profile: serializePublicTeamMember(team) });
  } catch (error) {
    if (handleValidationError(res, error)) return undefined;
    return res.status(400).json({ message: 'Unable to update member profile' });
  }
});

router.get('/certificates', async (req, res) => {
  try {
    const query = maybeSelect(
      Certificate.find({ memberId: req.member._id, teamId: req.member.teamId }).sort({ createdAt: -1 }),
      '+storage',
    );
    const certificates = await query;
    return res.json(certificates.map(certificate => certificatePayload(certificate)));
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch certificates' });
  }
});

router.post('/certificates', (req, res) => {
  certificateUpload.single('certificate')(req, res, async (uploadError) => {
    if (uploadError) return sendCertificateUploadError(res, uploadError);
    if (!req.file) return res.status(400).json({ message: 'No certificate file uploaded' });

    try {
      const metadata = sanitizeCertificateMetadata(req.body);
      const publicId = req.file.public_id || req.file.filename;
      if (typeof publicId !== 'string' || publicId.trim() === '') {
        throw new CertificateUploadStorageError('Certificate storage did not return a valid file identifier.');
      }

      const certificate = await Certificate.create({
        memberId: req.member._id,
        teamId: req.member.teamId,
        ...metadata,
        storage: {
          publicId,
          resourceType: req.file.resource_type || 'auto',
          format: req.file.format,
          bytes: req.file.bytes,
        },
      });
      return res.status(201).json(certificatePayload(certificate));
    } catch (error) {
      await cleanupCertificateAsset(req.file);
      if (handleValidationError(res, error)) return undefined;
      if (error instanceof CertificateUploadStorageError) return sendCertificateUploadError(res, error);
      return res.status(400).json({ message: 'Unable to save certificate' });
    }
  });
});

router.patch('/certificates/:id', async (req, res) => {
  try {
    const id = assertValidId(req.params.id, 'certificate');
    const updates = sanitizeCertificateMetadata(req.body, { partial: true });
    const certificate = await maybeSelect(Certificate.findOneAndUpdate(
      { _id: id, memberId: req.member._id, teamId: req.member.teamId },
      updates,
      { new: true, runValidators: true },
    ), '+storage');
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    return res.json(certificatePayload(certificate));
  } catch (error) {
    if (handleValidationError(res, error)) return undefined;
    return res.status(400).json({ message: 'Unable to update certificate' });
  }
});

router.delete('/certificates/:id', async (req, res) => {
  try {
    const id = assertValidId(req.params.id, 'certificate');
    const certificate = await maybeSelect(Certificate.findOne({
      _id: id,
      memberId: req.member._id,
      teamId: req.member.teamId,
    }), '+storage');
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    const storage = certificate.storage || {};
    if (storage.publicId && cloudinary?.uploader?.destroy) {
      try {
        await cloudinary.uploader.destroy(storage.publicId, getCertificateDestroyOptions(certificate));
      } catch (error) {
        return res.status(502).json({ message: 'Certificate storage deletion failed. Please try again.' });
      }
    }

    await Certificate.deleteOne({ _id: id, memberId: req.member._id, teamId: req.member.teamId });
    return res.json({ message: 'Certificate deleted' });
  } catch (error) {
    if (handleValidationError(res, error)) return undefined;
    return res.status(500).json({ message: 'Unable to delete certificate' });
  }
});

router.get('/certificates/:id', async (req, res) => {
  try {
    const id = assertValidId(req.params.id, 'certificate');
    const certificate = await maybeSelect(Certificate.findOne({
      _id: id,
      memberId: req.member._id,
      teamId: req.member.teamId,
    }), '+storage');
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    return res.json(certificatePayload(certificate));
  } catch (error) {
    if (handleValidationError(res, error)) return undefined;
    return res.status(400).json({ message: 'Unable to fetch certificate' });
  }
});

module.exports = router;
