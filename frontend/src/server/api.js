import { connectDatabase, isDatabaseReady } from './db';
import { Admin, Certificate, Event, Member, Team } from './models';
import {
  ApiError,
  createActivationToken,
  createAdminToken,
  createMemberToken,
  enforceRateLimit,
  hashActivationToken,
  hashPassword,
  verifyAdminRequest,
  verifyMemberToken,
  verifyPassword,
} from './security';
import {
  YEAR_PATTERN,
  assertId,
  normalizeMemberUsername,
  sanitizeCertificate,
  sanitizeCredentials,
  sanitizeEvent,
  sanitizeMemberCredentials,
  sanitizeMemberActivation,
  sanitizeMemberProfile,
  sanitizeProvisioning,
  sanitizeTeam,
  serializeCertificate,
  serializeTeam,
} from './validation';
import { certificateDownloadUrl, destroyFile, destroyImage, uploadFile } from './storage';

const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers });
const noStore = { 'Cache-Control': 'no-store' };
const parseJson = async (request) => {
  try { return await request.json(); } catch { throw new ApiError(400, 'Request body must be valid JSON'); }
};
const queryValue = (url, key) => {
  const values = url.searchParams.getAll(key);
  if (values.length > 1) throw new ApiError(400, `${key} must be a single value`);
  return values[0] ?? undefined;
};
const pathId = (value, label) => assertId(value, label);

const publicTeamProjection = 'name role category image socials bio committee academicYear branch skills interests achievements year isLead rank order';
const teamListProjection = `${publicTeamProjection} order`;
const publicEventProjection = '_id title date time location description image highlights category registrationLink onLandingPage createdAt';

const safeHttpUrl = (value) => {
  if (typeof value !== 'string' || /\s/.test(value)) return false;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
};

const serializePublicEvent = (event) => {
  const item = typeof event?.toObject === 'function' ? event.toObject() : (event || {});
  const result = {};
  if (item._id !== undefined) result._id = item._id;
  for (const field of ['title', 'date', 'time', 'location', 'description', 'category']) {
    if (typeof item[field] === 'string') result[field] = item[field];
  }
  if (typeof item.image === 'string' && safeHttpUrl(item.image)) result.image = item.image;
  if (typeof item.registrationLink === 'string' && safeHttpUrl(item.registrationLink)) result.registrationLink = item.registrationLink;
  if (typeof item.onLandingPage === 'boolean') result.onLandingPage = item.onLandingPage;
  if (item.createdAt !== undefined) result.createdAt = item.createdAt;
  if (Array.isArray(item.highlights)) {
    result.highlights = item.highlights.flatMap((photo) => {
      if (!photo || !safeHttpUrl(photo.url)) return [];
      const highlight = { url: photo.url };
      if (typeof photo.caption === 'string') highlight.caption = photo.caption;
      return [highlight];
    });
  }
  return result;
};

const getTeamFilter = (url) => {
  const allowed = new Set(['year', 'category', 'onLandingPage']);
  for (const key of url.searchParams.keys()) if (!allowed.has(key)) throw new ApiError(400, `Unsupported team filter: ${key}`);
  const filter = {};
  const year = queryValue(url, 'year');
  const category = queryValue(url, 'category');
  const onLandingPage = queryValue(url, 'onLandingPage');
  if (year !== undefined) {
    if (!YEAR_PATTERN.test(year)) throw new ApiError(400, 'year must use YYYY-YYYY format');
    filter.year = { $eq: year };
  }
  if (category !== undefined) {
    if (category !== 'All') filter.category = { $eq: category };
  }
  if (onLandingPage !== undefined) {
    if (!['true', 'false'].includes(onLandingPage)) throw new ApiError(400, 'onLandingPage must be true or false');
    filter.onLandingPage = { $eq: onLandingPage === 'true' };
  }
  return filter;
};

const sortTeam = (members) => [...members].sort((left, right) => {
  const leftRank = typeof left.rank === 'number' && Number.isFinite(left.rank) ? left.rank : null;
  const rightRank = typeof right.rank === 'number' && Number.isFinite(right.rank) ? right.rank : null;
  if (leftRank === null && rightRank !== null) return 1;
  if (leftRank !== null && rightRank === null) return -1;
  if (leftRank !== null && rightRank !== null && leftRank !== rightRank) return leftRank - rightRank;
  if (leftRank === null && rightRank === null) {
    const leftOrder = typeof left.order === 'number' ? left.order : 0;
    const rightOrder = typeof right.order === 'number' ? right.order : 0;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  }
  return String(left.name || '').localeCompare(String(right.name || ''), 'en', { sensitivity: 'base' });
});

const publicEvents = async (url) => {
  const fields = ['page', 'limit', 'search', 'category', 'onLandingPage'];
  for (const field of fields) {
    const value = queryValue(url, field);
    if (value !== undefined && typeof value !== 'string') throw new ApiError(400, `${field} must be a string`);
  }
  const search = queryValue(url, 'search') || '';
  if (search.length > 200) throw new ApiError(400, 'search must be at most 200 characters');
  const onLandingPage = queryValue(url, 'onLandingPage');
  if (onLandingPage !== undefined && !['true', 'false'].includes(onLandingPage)) throw new ApiError(400, 'onLandingPage must be true or false');
  const page = Math.max(1, Number.parseInt(queryValue(url, 'page'), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(queryValue(url, 'limit'), 10) || 12));
  const category = queryValue(url, 'category') || 'All';
  const query = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }];
  }
  if (category !== 'All') query.category = { $eq: category };
  if (onLandingPage === 'true') query.onLandingPage = true;
  const totalEvents = await Event.countDocuments(query);
  const events = await Event.find(query, publicEventProjection).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean();
  return { events: events.map(serializePublicEvent), currentPage: page, totalPages: Math.ceil(totalEvents / limit), totalEvents };
};

const publicTeamList = async (url) => {
  const filter = getTeamFilter(url);
  const members = await Team.find(filter, teamListProjection).lean();
  return sortTeam(members).map(serializeTeam);
};

const publicTeamYears = async (url) => {
  const filter = getTeamFilter(url);
  const years = await Team.distinct('year', filter);
  return [...new Set(years.filter((year) => typeof year === 'string' && YEAR_PATTERN.test(year)))].sort((a, b) => b.localeCompare(a));
};

const publicTeamDetail = async (id) => {
  const member = await Team.findById(pathId(id, 'team member'), publicTeamProjection).lean();
  if (!member) throw new ApiError(404, 'Team member not found');
  return serializeTeam(member);
};

const publicCertificates = async (id) => {
  const teamId = pathId(id, 'team member');
  if (!await Team.exists({ _id: teamId })) throw new ApiError(404, 'Team member not found');
  const certificates = await Certificate.find({ teamId, visibility: 'public' }).select('+storage').sort({ createdAt: -1 }).lean();
  return certificates.map((certificate) => serializeCertificate(certificate, certificateDownloadUrl(certificate)));
};

const authenticateMember = async (request) => {
  const claims = verifyMemberToken(request);
  const member = await Member.findById(claims.sub).select('+passwordHash +activationTokenHash +activationExpiresAt');
  const team = await Team.findById(claims.teamId);
  if (!member || !team || member.status !== 'active' || String(member.teamId) !== claims.teamId || Number(member.tokenVersion || 0) !== Number(claims.ver || 0)) {
    throw new ApiError(401, 'Member token is not valid');
  }
  return { member, team, claims };
};

const certificatePayload = (certificate) => serializeCertificate(certificate, certificateDownloadUrl(certificate));

const adminRoute = async (request, parts) => {
  const method = request.method;
  const action = parts[1];
  if (action === 'login' && parts.length === 2 && method === 'POST') {
    await enforceRateLimit(request, 'admin-login', 5, 60 * 60 * 1000);
    const { username, password } = sanitizeCredentials(await parseJson(request));
    const admin = await Admin.findOne({ username }).lean();
    if (!admin || !(await verifyPassword(password, admin.password))) throw new ApiError(401, 'Invalid credentials');
    return { token: createAdminToken(username) };
  }

  verifyAdminRequest(request);
  if (action === 'stats' && parts.length === 2 && method === 'GET') {
    const [eventsCount, teamCount, recentEvents, recentTeam] = await Promise.all([
      Event.countDocuments(), Team.countDocuments(), Event.find().sort({ createdAt: -1 }).limit(2).lean(), Team.find().sort({ createdAt: -1 }).limit(2).lean(),
    ]);
    return {
      eventsCount, teamCount, messagesCount: 0,
      recentActivity: [
        ...recentEvents.map((event) => ({ type: 'event', text: `New event "${event.title}" added`, date: event.createdAt })),
        ...recentTeam.map((member) => ({ type: 'team', text: `Team member "${member.name}" added`, date: member.createdAt })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)),
    };
  }
  if (action === 'upload' && parts.length === 2 && method === 'POST') {
    const form = await request.formData();
    const result = await uploadFile(form.get('image'));
    return { url: result.secure_url };
  }
  if (action === 'members' && parts.length === 3 && parts[2] === 'provision' && method === 'POST') {
    const { username, teamId } = sanitizeProvisioning(await parseJson(request));
    const team = await Team.findById(teamId);
    if (!team) throw new ApiError(404, 'Team member not found');
    if (await Member.findOne({ $or: [{ username }, { teamId }] })) throw new ApiError(409, 'A member account or team link already exists');
    const activationToken = createActivationToken();
    const member = await Member.create({
      username, teamId, status: 'pending', activationTokenHash: hashActivationToken(activationToken),
      activationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { __status: 201, body: {
      member: { id: member._id, username: member.username, status: member.status, teamId: member.teamId, activationExpiresAt: member.activationExpiresAt },
      activationToken,
    } };
  }
  if (action === 'events' && parts.length === 2) {
    if (method === 'POST') return { __status: 201, body: await Event.create(sanitizeEvent(await parseJson(request))) };
  }
  if (action === 'events' && parts.length === 3) {
    const id = pathId(parts[2], 'event');
    if (method === 'PUT') {
      const result = await Event.findByIdAndUpdate(id, sanitizeEvent(await parseJson(request), { partial: true }), { new: true, runValidators: true });
      if (!result) throw new ApiError(404, 'Event not found');
      return result;
    }
    if (method === 'DELETE') {
      const result = await Event.findByIdAndDelete(id);
      if (!result) throw new ApiError(404, 'Event not found');
      return { message: 'Event deleted' };
    }
  }
  if (action === 'team' && parts.length === 2 && method === 'POST') {
    return { __status: 201, body: await Team.create(sanitizeTeam(await parseJson(request))) };
  }
  if (action === 'team' && parts.length === 3) {
    const id = pathId(parts[2], 'team member');
    if (method === 'PUT') {
      const result = await Team.findByIdAndUpdate(id, sanitizeTeam(await parseJson(request), { partial: true }), { new: true, runValidators: true });
      if (!result) throw new ApiError(404, 'Member not found');
      return result;
    }
    if (method === 'DELETE') {
      const result = await Team.findByIdAndDelete(id);
      if (!result) throw new ApiError(404, 'Member not found');
      return { message: 'Member deleted' };
    }
  }
  throw new ApiError(404, 'API route not found');
};

const memberRoute = async (request, parts) => {
  const method = request.method;
  const action = parts[1];
  if (action === 'activate' && parts.length === 2 && method === 'POST') {
    await enforceRateLimit(request, 'member-login', 5, 60 * 60 * 1000);
    const { token, password } = sanitizeMemberActivation(await parseJson(request));
    const member = await Member.findOneAndUpdate(
      { activationTokenHash: hashActivationToken(token), status: 'pending', activationExpiresAt: { $gt: new Date() } },
      { $set: { passwordHash: await hashPassword(password), status: 'active', tokenVersion: 0 }, $unset: { activationTokenHash: 1, activationExpiresAt: 1 } },
      { new: true, runValidators: true },
    );
    if (!member) throw new ApiError(400, 'Activation link is invalid or expired');
    return { message: 'Member account activated' };
  }
  if (action === 'login' && parts.length === 2 && method === 'POST') {
    await enforceRateLimit(request, 'member-login', 5, 60 * 60 * 1000);
    const { username, password } = sanitizeMemberCredentials(await parseJson(request));
    const member = await Member.findOne({ username: normalizeMemberUsername(username) }).select('+passwordHash');
    if (!member || member.status !== 'active' || !(await verifyPassword(password, member.passwordHash))) throw new ApiError(401, 'Invalid credentials');
    return { token: createMemberToken({ memberId: member._id, teamId: member.teamId, tokenVersion: member.tokenVersion }) };
  }

  const { member, team } = await authenticateMember(request);
  if (action === 'me' && parts.length === 2 && method === 'GET') return { id: member._id, username: member.username, status: member.status, profile: serializeTeam(team) };
  if (action === 'logout' && parts.length === 2 && method === 'POST') {
    await Member.findByIdAndUpdate(member._id, { $inc: { tokenVersion: 1 } });
    return { message: 'Member signed out' };
  }
  if (action === 'profile' && parts.length === 2 && method === 'PATCH') {
    const updated = await Team.findOneAndUpdate({ _id: member.teamId }, sanitizeMemberProfile(await parseJson(request)), { new: true, runValidators: true }).lean();
    if (!updated) throw new ApiError(404, 'Member profile not found');
    return { profile: serializeTeam(updated) };
  }
  if (action === 'profile' && parts.length === 3 && parts[2] === 'image' && method === 'POST') {
    const form = await request.formData();
    const result = await uploadFile(form.get('image'));
    if (!result?.secure_url || !result?.public_id) throw new ApiError(502, 'Image storage returned an invalid response. Please try again.');

    try {
      const updated = await Team.findOneAndUpdate(
        { _id: member.teamId },
        { $set: { image: result.secure_url } },
        { new: true, runValidators: true },
      ).lean();
      if (!updated) throw new ApiError(404, 'Member profile not found');
      return { profile: serializeTeam(updated) };
    } catch (error) {
      try { await destroyImage({ publicId: result.public_id }); } catch { /* preserve the original profile error */ }
      throw error;
    }
  }
  if (action === 'certificates' && parts.length === 2) {
    if (method === 'GET') {
      const certificates = await Certificate.find({ memberId: member._id, teamId: member.teamId }).select('+storage').sort({ createdAt: -1 }).lean();
      return certificates.map(certificatePayload);
    }
    if (method === 'POST') {
      const form = await request.formData();
      const metadata = sanitizeCertificate({
        title: form.get('title'), issuer: form.get('issuer') || undefined, issuedAt: form.get('issuedAt') || undefined, visibility: form.get('visibility') || undefined,
      });
      const result = await uploadFile(form.get('certificate'), { certificate: true });
      try {
        const certificate = await Certificate.create({ memberId: member._id, teamId: member.teamId, ...metadata, storage: { publicId: result.public_id, resourceType: result.resource_type || 'auto', format: result.format, bytes: result.bytes } });
        return { __status: 201, body: { ...certificatePayload(certificate.toObject()), downloadUrl: certificateDownloadUrl({ ...certificate.toObject(), storage: { publicId: result.public_id, resourceType: result.resource_type || 'auto' } }) } };
      } catch (error) {
        try { await destroyFile({ publicId: result.public_id, resourceType: result.resource_type || 'auto' }); } catch { /* preserve database error */ }
        throw error;
      }
    }
  }
  if (action === 'certificates' && parts.length === 3) {
    const id = pathId(parts[2], 'certificate');
    const ownerFilter = { _id: id, memberId: member._id, teamId: member.teamId };
    if (method === 'GET') {
      const certificate = await Certificate.findOne(ownerFilter).select('+storage').lean();
      if (!certificate) throw new ApiError(404, 'Certificate not found');
      return certificatePayload(certificate);
    }
    if (method === 'PATCH') {
      const certificate = await Certificate.findOneAndUpdate(ownerFilter, sanitizeCertificate(await parseJson(request), { partial: true }), { new: true, runValidators: true }).select('+storage').lean();
      if (!certificate) throw new ApiError(404, 'Certificate not found');
      return certificatePayload(certificate);
    }
    if (method === 'DELETE') {
      const certificate = await Certificate.findOne(ownerFilter).select('+storage').lean();
      if (!certificate) throw new ApiError(404, 'Certificate not found');
      await destroyFile(certificate.storage);
      await Certificate.deleteOne(ownerFilter);
      return { message: 'Certificate deleted' };
    }
  }
  throw new ApiError(404, 'API route not found');
};

export const handleApiRequest = async (request, parts) => {
  try {
    if (parts[0] === 'health' && request.method === 'GET') {
      try { await connectDatabase(); } catch { return json({ status: 'not_ready', database: 'disconnected' }, 503, noStore); }
      return json({ status: isDatabaseReady() ? 'ready' : 'not_ready', database: isDatabaseReady() ? 'connected' : 'disconnected' }, isDatabaseReady() ? 200 : 503, noStore);
    }
    await connectDatabase();
    await enforceRateLimit(request, 'global', 100, 15 * 60 * 1000);

    if (parts[0] === 'events' && parts.length === 1 && request.method === 'GET') return json(await publicEvents(new URL(request.url)));
    if (parts[0] === 'team' && parts.length === 1 && request.method === 'GET') return json(await publicTeamList(new URL(request.url)));
    if (parts[0] === 'team' && parts.length === 2 && parts[1] === 'years' && request.method === 'GET') return json(await publicTeamYears(new URL(request.url)));
    if (parts[0] === 'team' && parts.length === 2 && request.method === 'GET') return json(await publicTeamDetail(parts[1]));
    if (parts[0] === 'team' && parts.length === 3 && parts[2] === 'certificates' && request.method === 'GET') return json(await publicCertificates(parts[1]));
    if (parts[0] === 'contact' && parts.length === 1 && request.method === 'POST') {
      const body = await parseJson(request);
      if (body && typeof body === 'object') await enforceRateLimit(request, 'contact', 5, 15 * 60 * 1000);
      return json({ message: 'Thank you for your message. We will get back to you soon!' }, 200, noStore);
    }
    if (parts[0] === 'admin') {
      const result = await adminRoute(request, parts);
      return json(result?.__status ? result.body : result, result?.__status || 200, noStore);
    }
    if (parts[0] === 'member') {
      const result = await memberRoute(request, parts);
      return json(result?.__status ? result.body : result, result?.__status || 200, noStore);
    }
    throw new ApiError(404, 'API route not found');
  } catch (error) {
    if (error instanceof ApiError) return json({ message: error.message }, error.status, error.status === 401 || error.status === 503 ? noStore : undefined);
    if (error?.code === 11000) return json({ message: 'A member account or team link already exists' }, 409, noStore);
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return json({ message: 'Invalid request data' }, 400);
    }
    if (!isDatabaseReady() || /Mongo|database is not configured/i.test(String(error?.message || ''))) {
      return json({ message: 'Service unavailable' }, 503, noStore);
    }
    console.error(JSON.stringify({ event: 'next_api_request_failed', errorClass: error?.constructor?.name || typeof error }));
    return json({ message: 'Unable to process request' }, 500);
  }
};
