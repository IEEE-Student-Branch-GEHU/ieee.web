import { motion } from 'framer-motion';
import { BsLinkedin, BsInstagram, BsEnvelope } from 'react-icons/bs';
import ieeeLogo from '../../assets/logo.png';
import './MemberCard.css';

const MemberCard = ({ member, index = 0 }) => {
  const { name, role, category, isLead, email, image, socials } = member;

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className={`prof-card ${isLead ? 'prof-card--lead' : ''}`}
    >
      {/* Category Badge (Subtle) */}
      {category && category !== 'executive' && !isLead && (
        <div className="prof-card__badge">{category}</div>
      )}

      {/* Image Section (4:5 Aspect Ratio) */}
      <div className="prof-card__img-container">
        {image ? (
          <img src={image} alt={name} className="prof-card__img" loading="lazy" />
        ) : (
          <div className="prof-card__fallback">
            <img src={ieeeLogo} alt="IEEE" className="prof-card__fallback-logo" />
            <span className="prof-card__initials">{initials}</span>
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="prof-card__overlay" />

        {/* Floating Social Actions (Slide up) */}
        <div className="prof-card__actions">
          <a 
            href={socials?.linkedin || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="prof-card__social-link"
            title="LinkedIn"
          >
            <BsLinkedin />
          </a>
          <a 
            href={socials?.instagram || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="prof-card__social-link"
            title="Instagram"
          >
            <BsInstagram />
          </a>
          {email && (
            <a 
              href={`mailto:${email}`} 
              className="prof-card__social-link"
              title="Email"
            >
              <BsEnvelope />
            </a>
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="prof-card__content">
        <h3 className="prof-card__name">{name}</h3>
        <p className="prof-card__role">{role}</p>
      </div>
    </motion.div>
  );
};

export default MemberCard;
