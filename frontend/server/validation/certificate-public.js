const { getCertificateDownloadUrl } = require('../services/certificate-storage');

const sourceOf = (certificate) => (
  certificate && typeof certificate.toObject === 'function'
    ? certificate.toObject({ virtuals: false })
    : (certificate || {})
);

const serializeCertificate = (certificate, { cloudinary, includeDownloadUrl = false } = {}) => {
  const source = sourceOf(certificate);
  const result = {};
  if (source._id !== undefined) result._id = source._id;
  if (typeof source.title === 'string') result.title = source.title;
  if (typeof source.issuer === 'string' && source.issuer) result.issuer = source.issuer;
  if (source.issuedAt) result.issuedAt = source.issuedAt;
  if (source.visibility === 'public' || source.visibility === 'private') result.visibility = source.visibility;
  if (source.createdAt) result.createdAt = source.createdAt;

  if (includeDownloadUrl) {
    const downloadUrl = getCertificateDownloadUrl(source, cloudinary);
    if (downloadUrl) result.downloadUrl = downloadUrl;
  }
  return result;
};

module.exports = { serializeCertificate };
