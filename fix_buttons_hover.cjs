const fs = require('fs');
const path = 'app/admin/AdminStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// Hide floating buttons during hover
content = content.replace(
  /\{!leftPanelOpen && <button type="button" className="panel-reopen panel-reopen-left"/g,
  '{!isLeftVisible && <button type="button" className="panel-reopen panel-reopen-left"'
);

content = content.replace(
  /\{!rightPanelOpen && <button type="button" className="panel-reopen panel-reopen-right"/g,
  '{!isRightVisible && <button type="button" className="panel-reopen panel-reopen-right"'
);

// Hide internal close buttons during hover (left panel)
content = content.replace(
  /<div className="panel-header"><span>기획서 <b>\{newWorkingDrafts\.length \+ savedDocuments\.length\}<\/b><\/span><button type="button" aria-label="기획서 목록 접기"/,
  '<div className="panel-header"><span>기획서 <b>{newWorkingDrafts.length + savedDocuments.length}</b></span>{leftPanelOpen && <button type="button" aria-label="기획서 목록 접기"'
);
content = content.replace(
  /setMobileLibraryOpen\(false\); \}\}>\s*<PanelLeftIcon size=\{19\}\/>\s*<\/button><\/div>/,
  'setMobileLibraryOpen(false); }}><PanelLeftIcon size={19}/></button>}</div>'
);

// Hide internal close buttons during hover (right panel)
content = content.replace(
  /<div className="preview-label"><span>실제 공개 화면<small>내용과 스타일이 그대로 공개됩니다\.<\/small><\/span><button type="button" aria-label="미리보기 접기"/,
  '<div className="preview-label"><span>실제 공개 화면<small>내용과 스타일이 그대로 공개됩니다.</small></span>{rightPanelOpen && <button type="button" aria-label="미리보기 접기"'
);
content = content.replace(
  /onClick=\{\(\) => setRightPanelOpen\(false\)\}>\s*<PanelRightIcon size=\{19\}\/>\s*<\/button><\/div>/,
  'onClick={() => setRightPanelOpen(false)}><PanelRightIcon size={19}/></button>}</div>'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
