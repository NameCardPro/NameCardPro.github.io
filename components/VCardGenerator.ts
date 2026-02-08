
import { BusinessCardData } from '../types';

export function generateVCard(card: BusinessCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name}`,
    `ORG:${card.company};${card.department}`,
    `TITLE:${card.title}`,
    `TEL;TYPE=CELL,VOICE:${card.mobile}`,
    `TEL;TYPE=WORK,VOICE:${card.workPhone}`,
    `EMAIL;TYPE=PREF,INTERNET:${card.email}`,
    `ADR;TYPE=WORK:;;${card.address}`,
    `URL:${card.website}`,
    `NOTE:${card.remark || ''}`,
    'END:VCARD'
  ];
  return lines.join('\n');
}

export function downloadVCard(card: BusinessCardData) {
  const vcard = generateVCard(card);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${card.name}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
