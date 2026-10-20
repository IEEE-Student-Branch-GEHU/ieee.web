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

module.exports = { createProvisioningError, provisionMemberAccount };
