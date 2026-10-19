const SOCIAL_FIELDS = ['linkedin', 'instagram', 'twitter', 'github'];

export const EMPTY_MEMBER_FORM = {
    name: '',
    role: '',
    bio: '',
    image: '',
    category: 'executive',
    committee: '',
    academicYear: '',
    branch: '',
    year: '',
    skills: [],
    interests: [],
    achievements: [],
    isLead: false,
    rank: '',
    order: '',
    socials: {},
    linkedin: '',
    instagram: '',
    twitter: '',
    github: '',
};

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asString = (value) => typeof value === 'string' ? value : '';
const asStringArray = (value) => Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];

export const createMemberForm = (member, category = 'executive') => {
    const existingSocials = isRecord(member?.socials) ? member.socials : {};
    const form = {
        ...EMPTY_MEMBER_FORM,
        category,
        name: asString(member?.name),
        role: asString(member?.role),
        bio: asString(member?.bio),
        image: asString(member?.image),
        committee: asString(member?.committee),
        academicYear: asString(member?.academicYear),
        branch: asString(member?.branch),
        year: asString(member?.year),
        skills: asStringArray(member?.skills),
        interests: asStringArray(member?.interests),
        achievements: asStringArray(member?.achievements),
        isLead: member?.isLead === true,
        rank: member?.rank ?? '',
        order: member?.order ?? '',
        socials: { ...existingSocials },
    };

    for (const field of SOCIAL_FIELDS) {
        form[field] = asString(member?.[field] ?? existingSocials[field]);
    }

    return form;
};

const cleanArray = (value) => asStringArray(value).map(item => item.trim()).filter(Boolean);

const optionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
};

export const buildMemberPayload = (formData, { category } = {}) => {
    const form = formData || EMPTY_MEMBER_FORM;
    const payload = {
        name: asString(form.name),
        role: asString(form.role),
        category: asString(category ?? form.category),
        image: asString(form.image),
        bio: asString(form.bio),
        committee: asString(form.committee),
        academicYear: asString(form.academicYear),
        branch: asString(form.branch),
        year: asString(form.year),
        skills: cleanArray(form.skills),
        interests: cleanArray(form.interests),
        achievements: cleanArray(form.achievements),
        isLead: form.isLead === true,
    };

    const rank = optionalNumber(form.rank);
    if (rank !== undefined) payload.rank = rank;

    const order = optionalNumber(form.order);
    if (order !== undefined) payload.order = order;

    const existingSocials = isRecord(form.socials) ? form.socials : {};
    const socials = {};
    for (const field of SOCIAL_FIELDS) {
        const value = form[field] ?? existingSocials[field];
        if (value !== undefined) socials[field] = asString(value);
    }
    payload.socials = socials;

    return payload;
};
