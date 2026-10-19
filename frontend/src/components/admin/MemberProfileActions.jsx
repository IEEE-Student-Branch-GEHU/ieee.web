import { ExternalLink, QrCode } from 'lucide-react';
import Modal from '../ui/modal';
import MemberQr from '../members/MemberQr';
import { useState } from 'react';
import { getStableMemberId } from '../../lib/public-site';

const MemberProfileActions = ({ member }) => {
    const [isQrOpen, setIsQrOpen] = useState(false);
    const memberId = getStableMemberId(member);

    if (!memberId) return null;

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <a
                href={`/members/${memberId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <ExternalLink size={16} aria-hidden="true" />
                Open profile
            </a>
            <button
                type="button"
                aria-label={`View QR code for ${member.name}`}
                onClick={() => setIsQrOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <QrCode size={16} aria-hidden="true" />
                View QR
            </button>

            {isQrOpen && (
                <Modal title={`QR code for ${member.name}`} closeLabel="Close QR code" onClose={() => setIsQrOpen(false)}>
                    <div className="p-4 sm:p-6">
                        <MemberQr member={member} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MemberProfileActions;
