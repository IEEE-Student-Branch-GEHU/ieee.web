import { handleApiRequest } from '../../../server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = (request, { params }) => params.then(({ path }) => handleApiRequest(request, path || []));

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
