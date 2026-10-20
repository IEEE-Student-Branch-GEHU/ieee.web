const {
  ACTIVATION_TOKEN_TTL_MS,
  createActivationToken,
  hashActivationToken,
} = require('./member-auth');

const createProvisioningError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const provisionMemberAccount = async ({
  MemberModel,
  TeamModel,
  teamId,
  username,
  now = new Date(),
  activationTtlMs = ACTIVATION_TOKEN_TTL_MS,
}) => {
  const team = await TeamModel.findById(teamId);
  if (!team) throw createProvisioningError('TEAM_NOT_FOUND', 'Team member not found');

  const existing = await MemberModel.findOne({ $or: [{ username }, { teamId }] });
  if (existing) throw createProvisioningError('ACCOUNT_EXISTS', 'A member account or team link already exists');

  const activationToken = createActivationToken();
  const member = await MemberModel.create({
    teamId,
    username,
    status: 'pending',
    activationTokenHash: hashActivationToken(activationToken),
    activationExpiresAt: new Date(now.getTime() + activationTtlMs),
    tokenVersion: 0,
  });

  return { activationToken, member };
};

// Authorizes a Google account email for a Team profile. Profiles without a
// member account get one with no password, so Google is their only sign-in.
const authorizeMemberGoogleEmail = async ({ MemberModel, TeamModel, teamId, email }) => {
  const team = await TeamModel.findById(teamId);
  if (!team) throw createProvisioningError('TEAM_NOT_FOUND', 'Team member not found');

  const emailOwner = await MemberModel.findOne({ email });
  if (emailOwner && String(emailOwner.teamId) !== String(teamId)) {
    throw createProvisioningError('EMAIL_IN_USE', 'This email is already authorized for another member');
  }

  const existing = await MemberModel.findOne({ teamId });
  if (!existing) {
    return MemberModel.create({
      teamId,
      username: `member-${String(teamId).toLowerCase()}`,
      email,
      status: 'active',
      tokenVersion: 0,
    });
  }
  if (existing.email === email) return existing;

  // A changed email must not keep the previous Google account signed in.
  return MemberModel.findOneAndUpdate(
    { _id: existing._id },
    {
      $set: { email },
      $unset: { googleSubject: 1 },
      ...(existing.email ? { $inc: { tokenVersion: 1 } } : {}),
    },
    { new: true, runValidators: true },
  );
};

const revokeMemberGoogleEmail = ({ MemberModel, teamId }) => MemberModel.findOneAndUpdate(
  { teamId, email: { $exists: true } },
  { $unset: { email: 1, googleSubject: 1 }, $inc: { tokenVersion: 1 } },
  { new: true },
);

module.exports = {
  authorizeMemberGoogleEmail,
  createProvisioningError,
  provisionMemberAccount,
  revokeMemberGoogleEmail,
};
