const fs = require('fs');
const path = 'components/Icons.tsx';
let content = fs.readFileSync(path, 'utf8');

const newIcons = `
export function PanelLeftOpenIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M9 4v16M4.8 9.5 6.5 12l-1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}

export function PanelRightOpenIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M15 4v16m4.2-10.5-1.7 2.5 1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}
`;

content = content + newIcons;
fs.writeFileSync(path, content, 'utf8');
console.log("Done");
