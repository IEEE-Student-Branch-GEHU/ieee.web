const ARRAY_FIELDS = ['skills', 'interests', 'achievements'];

const inputClass = 'admin-input w-full min-w-0 rounded-xl border px-4 py-2 outline-none';
const labelClass = 'admin-label mb-1 block text-xs font-bold uppercase';

const MemberProfileFields = ({ formData, onChange, idPrefix = 'member' }) => {
    const updateField = (field, value) => onChange({ ...formData, [field]: value });
    const updateArray = (field, value) => updateField(field, value.split(/\r?\n/).map(item => item.trim()).filter(Boolean));
    const arrayText = (field) => (Array.isArray(formData[field]) ? formData[field] : []).join('\n');

    return (
        <section aria-labelledby={`${idPrefix}-profile-heading`} className="admin-profile-section space-y-4 border-t pt-4">
            <div>
                <h3 id={`${idPrefix}-profile-heading`} className="admin-heading font-bold">Public profile</h3>
                <p id={`${idPrefix}-profile-help`} className="admin-table-secondary mt-1 text-sm leading-relaxed">
                    These optional fields are published on the public member profile. Enter approved information only; do not include private email addresses or phone numbers.
                </p>
            </div>

            <div>
                <label htmlFor={`${idPrefix}-bio`} className={labelClass}>Short Bio</label>
                <textarea
                    id={`${idPrefix}-bio`}
                    value={formData.bio}
                    onChange={event => updateField('bio', event.target.value)}
                    aria-describedby={`${idPrefix}-profile-help`}
                    className={`${inputClass} h-20 resize-none`}
                />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${idPrefix}-committee`} className={labelClass}>Committee</label>
                    <input id={`${idPrefix}-committee`} value={formData.committee} onChange={event => updateField('committee', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-branch`} className={labelClass}>Branch</label>
                    <input id={`${idPrefix}-branch`} value={formData.branch} onChange={event => updateField('branch', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-academic-year`} className={labelClass}>Academic year</label>
                    <input id={`${idPrefix}-academic-year`} value={formData.academicYear} onChange={event => updateField('academicYear', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-year`} className={labelClass}>Year (YYYY-YYYY)</label>
                    <input
                        id={`${idPrefix}-year`}
                        value={formData.year}
                        onChange={event => updateField('year', event.target.value)}
                        pattern="[0-9]{4}-[0-9]{4}"
                        placeholder="2025-2026"
                        required
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                {ARRAY_FIELDS.map(field => (
                    <div key={field}>
                        <label htmlFor={`${idPrefix}-${field}`} className={labelClass}>
                            {field[0].toUpperCase() + field.slice(1)} (one per line)
                        </label>
                        <textarea
                            id={`${idPrefix}-${field}`}
                            value={arrayText(field)}
                            onChange={event => updateArray(field, event.target.value)}
                            className={`${inputClass} min-h-20 resize-y`}
                        />
                    </div>
                ))}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${idPrefix}-rank`} className={labelClass}>Rank</label>
                    <input id={`${idPrefix}-rank`} type="number" min="0" step="1" value={formData.rank} onChange={event => updateField('rank', event.target.value)} className={inputClass} />
                </div>
                <label htmlFor={`${idPrefix}-is-lead`} className="admin-table-secondary flex min-h-10 items-center gap-3 self-end text-sm font-medium">
                    <input id={`${idPrefix}-is-lead`} type="checkbox" checked={formData.isLead} onChange={event => updateField('isLead', event.target.checked)} className="h-4 w-4 accent-primary" />
                    Lead member
                </label>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${idPrefix}-linkedin`} className={labelClass}>LinkedIn URL</label>
                    <input id={`${idPrefix}-linkedin`} type="url" value={formData.linkedin} onChange={event => updateField('linkedin', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-instagram`} className={labelClass}>Instagram URL</label>
                    <input id={`${idPrefix}-instagram`} type="url" value={formData.instagram} onChange={event => updateField('instagram', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-github`} className={labelClass}>GitHub URL</label>
                    <input id={`${idPrefix}-github`} name="github" type="url" autoComplete="url" value={formData.github} onChange={event => updateField('github', event.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-twitter`} className={labelClass}>Twitter/X URL</label>
                    <input id={`${idPrefix}-twitter`} type="url" value={formData.twitter} onChange={event => updateField('twitter', event.target.value)} className={inputClass} />
                </div>
            </div>
        </section>
    );
};

export default MemberProfileFields;
