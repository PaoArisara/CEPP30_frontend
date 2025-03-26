import{c as o}from"./createLucideIcon-BSuAhcd7.js";import{j as e}from"./index-Bluomjo3.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]],m=o("History",p),j=({children:s,className:r=""})=>e.jsx("div",{className:`p-4 border-b ${r}`,children:s}),g=({children:s,className:r=""})=>e.jsx("h2",{className:`text-xl font-semibold leading-none tracking-tight ${r}`,children:s}),u=({headers:s,data:r,emptyMessage:i="ไม่พบข้อมูล",maxHeight:d="400px",onRowClick:c,actions:l,rowClassName:x})=>e.jsx("div",{className:"w-full overflow-hidden border border-gray-200 rounded",children:e.jsx("div",{className:"overflow-x-auto",style:{maxHeight:d},...d?{"data-scrollable":"true"}:{},children:e.jsxs("table",{className:"min-w-full relative",children:[e.jsx("thead",{className:"bg-gray-50 sticky top-0 z-10",children:e.jsxs("tr",{children:[s.map(t=>e.jsx("th",{className:`
                    px-4 py-3 
                    text-left text-xs 
                    font-medium text-header
                    uppercase 
                    sticky top-0 
                    bg-gray-50 
                    ${t.className||""}
                  `,children:t.label},t.key)),l&&e.jsx("th",{className:"px-4 py-3 text-center text-xs font-medium text-header uppercase sticky top-0 bg-gray-50",children:"จัดการ"})]})}),e.jsx("tbody",{className:"bg-white divide-y divide-gray-200",children:r.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:s.length+(l?1:0),className:"px-4 py-4 text-center text-mediumGray",children:i})}):r.map((t,n)=>e.jsxs("tr",{className:`
                    text-header
                    hover:bg-gray-50 
                    transition-colors 
                    ${c?"cursor-pointer":""}
                    ${x?x(t,n):""}
                  `,onClick:()=>c&&c(t),children:[s.map(a=>e.jsx("td",{className:`
                        text-header
                        px-4 py-4 text-sm
                        ${a.className||""}
                      `,children:a.render?a.render(t):t[a.key]??"-"},a.key)),l&&e.jsx("td",{className:"px-4 py-4 text-center text-header",children:e.jsx("div",{className:"flex justify-center space-x-2",children:l(t)})})]},t.id||n))})]})})});export{j as D,m as H,u as T,g as a};
