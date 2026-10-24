import QRCode from 'qrcode';

export const MEMBER_QR_LOGO_PATH = '/brand/member-qr-logo.png';
export const MEMBER_QR_COLORS = { module: '#0b2a5b', eyeRing: '#1f4ba0', eyeCenter: '#0b2a5b', light: '#ffffff' };

const MARGIN = 4;
const FINDER_SIZE = 7;
const LOGO_ASPECT_RATIO = 560 / 283;
// Error correction level H restores up to ~30% of the symbol; the logo plate stays well under that.
const LOGO_PLATE_WIDTH_RATIO = 0.44;
const LOGO_PLATE_PADDING = 0.8;
const LOGO_CLEARANCE = 0.5;

const n = value => Number(value.toFixed(3));

const roundedRect = (x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  return `M${n(x + r)} ${n(y)}H${n(x + width - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width)} ${n(y + r)}`
    + `V${n(y + height - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + width - r)} ${n(y + height)}`
    + `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + height - r)}`
    + `V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`;
};

// A module keeps a square corner wherever it touches a neighbour, so adjacent modules flow together.
const modulePath = (x, y, [top, right, bottom, left]) => {
  const corner = (a, b) => (a || b ? 0 : 0.5);
  const tl = corner(top, left);
  const tr = corner(top, right);
  const br = corner(bottom, right);
  const bl = corner(bottom, left);
  const arc = (r, toX, toY) => (r ? `A${r} ${r} 0 0 1 ${toX} ${toY}` : `L${toX} ${toY}`);
  return `M${x + tl} ${y}H${x + 1 - tr}${arc(tr, x + 1, y + tr)}V${y + 1 - br}${arc(br, x + 1 - br, y + 1)}`
    + `H${x + bl}${arc(bl, x, y + 1 - bl)}V${y + tl}${arc(tl, x + tl, y)}Z`;
};

const isFinderModule = (row, col, size) => (
  (row < FINDER_SIZE && col < FINDER_SIZE)
  || (row < FINDER_SIZE && col >= size - FINDER_SIZE)
  || (row >= size - FINDER_SIZE && col < FINDER_SIZE)
);

const getLogoPlate = size => {
  const width = size * LOGO_PLATE_WIDTH_RATIO;
  const height = (width - 2 * LOGO_PLATE_PADDING) / LOGO_ASPECT_RATIO + 2 * LOGO_PLATE_PADDING;
  return { x: (size - width) / 2, y: (size - height) / 2, width, height };
};

const overlapsPlate = (row, col, plate) => (
  col + 1 > plate.x - LOGO_CLEARANCE && col < plate.x + plate.width + LOGO_CLEARANCE
  && row + 1 > plate.y - LOGO_CLEARANCE && row < plate.y + plate.height + LOGO_CLEARANCE
);

const escapeAttribute = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const buildMemberQrSvg = (text, { logo = null } = {}) => {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const { size } = modules;
  const plate = logo ? getLogoPlate(size) : null;
  const isDark = (row, col) => (
    row >= 0 && col >= 0 && row < size && col < size
    && Boolean(modules.get(row, col))
    && !isFinderModule(row, col, size)
    && !(plate && overlapsPlate(row, col, plate))
  );

  let data = '';
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!isDark(row, col)) continue;
      data += modulePath(col + MARGIN, row + MARGIN, [
        isDark(row - 1, col), isDark(row, col + 1), isDark(row + 1, col), isDark(row, col - 1),
      ]);
    }
  }

  const eyes = [[0, 0], [0, size - FINDER_SIZE], [size - FINDER_SIZE, 0]].map(([row, col]) => {
    const x = col + MARGIN;
    const y = row + MARGIN;
    return {
      ring: roundedRect(x, y, 7, 7, 2.2) + roundedRect(x + 1, y + 1, 5, 5, 1.4),
      center: roundedRect(x + 2, y + 2, 3, 3, 0.9),
    };
  });

  const total = size + 2 * MARGIN;
  const { module, eyeRing, eyeCenter, light } = MEMBER_QR_COLORS;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${total} ${total}" width="1024" height="1024">`,
    `<rect width="${total}" height="${total}" rx="2" fill="${light}"/>`,
    `<path fill="${module}" d="${data}"/>`,
    `<path fill="${eyeRing}" fill-rule="evenodd" d="${eyes.map(eye => eye.ring).join('')}"/>`,
    `<path fill="${eyeCenter}" d="${eyes.map(eye => eye.center).join('')}"/>`,
  ];

  if (plate) {
    const x = plate.x + MARGIN;
    const y = plate.y + MARGIN;
    parts.push(
      `<rect x="${n(x)}" y="${n(y)}" width="${n(plate.width)}" height="${n(plate.height)}" rx="1.2" fill="${light}"/>`,
      `<image x="${n(x + LOGO_PLATE_PADDING)}" y="${n(y + LOGO_PLATE_PADDING)}" width="${n(plate.width - 2 * LOGO_PLATE_PADDING)}" `
        + `height="${n(plate.height - 2 * LOGO_PLATE_PADDING)}" preserveAspectRatio="xMidYMid meet" xlink:href="${escapeAttribute(logo)}"/>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
};

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

let logoRequest = null;

// The logo is inlined as a data URI so downloaded SVGs stay self-contained.
export const loadMemberQrLogo = () => {
  logoRequest ??= fetch(MEMBER_QR_LOGO_PATH)
    .then(response => {
      if (!response.ok) throw new Error(`Logo request failed with HTTP ${response.status}`);
      return response.blob();
    })
    .then(blobToDataUrl)
    .catch(() => {
      logoRequest = null;
      return null;
    });
  return logoRequest;
};

export const createMemberQrSvg = async text => buildMemberQrSvg(text, { logo: await loadMemberQrLogo() });
