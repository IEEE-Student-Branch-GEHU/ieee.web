const getCertificateStorage = (certificate) => certificate?.storage || {};

const getCertificateDownloadUrl = (certificate, cloudinaryClient) => {
  const storage = getCertificateStorage(certificate);
  if (!storage.publicId || !cloudinaryClient || typeof cloudinaryClient.url !== 'function') return null;

  return cloudinaryClient.url(storage.publicId, {
    secure: true,
    sign_url: true,
    type: 'authenticated',
    resource_type: storage.resourceType || 'auto',
  });
};

const getCertificateDestroyOptions = (certificate) => {
  const storage = getCertificateStorage(certificate);
  return {
    resource_type: storage.resourceType || 'auto',
    type: 'authenticated',
  };
};

module.exports = { getCertificateDestroyOptions, getCertificateDownloadUrl };
