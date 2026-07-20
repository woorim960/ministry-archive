const fs = require('fs');
const path = 'components/Icons.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace PanelLeftIcon
content = content.replace(
  /export function PanelLeftIcon[\s\S]*?<\/Base>;\n\}/,
  `export function PanelLeftIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 4h5.5v16h-5.5z" fill="currentColor" opacity="0.2"/><path d="M9 4v16M6.5 9.5 4.8 12l1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}`
);

// Replace PanelRightIcon
content = content.replace(
  /export function PanelRightIcon[\s\S]*?<\/Base>;\n\}/,
  `export function PanelRightIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M15 4h5.5v16h-5.5z" fill="currentColor" opacity="0.2"/><path d="M15 4v16m2.5-10.5 1.7 2.5-1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}`
);

// Replace PanelLeftOpenIcon
content = content.replace(
  /export function PanelLeftOpenIcon[\s\S]*?<\/Base>;\n\}/,
  `export function PanelLeftOpenIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3"/><path d="M9 4v16M4.8 9.5 6.5 12l-1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}`
);

// Replace PanelRightOpenIcon
content = content.replace(
  /export function PanelRightOpenIcon[\s\S]*?<\/Base>;\n\}/,
  `export function PanelRightOpenIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3"/><path d="M15 4v16m4.2-10.5-1.7 2.5 1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
