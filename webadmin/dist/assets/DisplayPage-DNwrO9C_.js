import{r as l,j as e}from"./index-Bluomjo3.js";import{u as E}from"./BaseSocketService-Bl9hlbK-.js";import{P as Z}from"./ParkingSocketService-CWr6cezM.js";import{M as D}from"./MapDisplay-UgpScvv1.js";const P=()=>{const s=E(Z,!0),[t,r]=l.useState(!1),[f,i]=l.useState(!1),[x,a]=l.useState(!1),[o,d]=l.useState(null),[j,B]=l.useState({zone:"A",floor:"01"}),[b,C]=l.useState({zone:"B",floor:"01"}),[v,y]=l.useState([{occupied:[],available:[],summary:{total:0,occupied:0,available:0,location:{zone:"",floor:""}}}]),[k,N]=l.useState([{occupied:[],available:[],summary:{total:0,occupied:0,available:0,location:{zone:"",floor:""}}}]),m=l.useCallback(n=>{if(!(s!=null&&s.connected)||!t){d("รอการเชื่อมต่อ...");return}n==="A"?i(!0):a(!0);try{s.emit("getSlotStatus",{zone:n},c=>{c.success?(n==="A"?(y(c.data),console.log("A",v),i(!1)):(N(c.data),a(!1)),d(null)):(d(c.error||"ไม่สามารถโหลดข้อมูลได้"),n==="A"?i(!1):a(!1))})}catch(c){console.error(`Error fetching Zone ${n} data:`,c),d("เกิดข้อผิดพลาดในการโหลดข้อมูล"),n==="A"?i(!1):a(!1)}},[s,t]),h=l.useCallback(()=>{m("A"),m("B")},[m,j.floor,b.floor]),w=l.useCallback((n,c)=>{n==="A"?B(u=>({...u,floor:c})):C(u=>({...u,floor:c}))},[]);return l.useEffect(()=>{if(!s)return;const n=()=>{console.log("🔗 Socket connected successfully"),r(!0)},c=()=>{console.log("⚠️ Socket disconnected"),r(!1),d("การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...")},u=p=>{if(p.success&&p.data.length>0){const S=p.data[0];S.summary.location.zone==="A"?y(p.data):S.summary.location.zone==="B"&&N(p.data),d(null)}},g=()=>{h()};return s.on("connect",n),s.on("disconnect",c),s.on("slotStatusUpdated",u),s.on("recordCreated",g),s.on("recordRemoved",g),s.connected&&r(!0),()=>{s.off("connect",n),s.off("disconnect",c),s.off("slotStatusUpdated",u),s.off("recordCreated",g),s.off("recordRemoved",g)}},[s,h]),l.useEffect(()=>{t&&h()},[t,h]),l.useEffect(()=>{t&&m("A")},[t,m]),l.useEffect(()=>{t&&m("B")},[t,m]),{loadingA:f,loadingB:x,isConnected:t,error:o,slotStatsAData:v,slotStatsBData:k,filtersA:j,filtersB:b,updateZoneFloor:w}},A=({zone:s,floor:t,slotStatsData:r,loading:f,updateZoneFloor:i,handleClick:x})=>{const a=r.find(o=>o.summary.location.floor===t);return e.jsxs("div",{className:"bg-white rounded shadow-sm",children:[e.jsx("p",{className:"p-4",children:e.jsxs("p",{className:"text-xl font-bold text-header",children:["ลานจอด ",s," ชั้น ",t]})}),e.jsx("div",{className:"p-4",children:e.jsxs("div",{className:"grid grid-cols-12 gap-4",children:[e.jsxs("div",{className:"col-span-12 md:col-span-8",children:[e.jsxs("div",{className:"border rounded p-4 bg-gray-50 relative",children:[f&&e.jsx("div",{className:"absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center backdrop-blur-sm",children:e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("span",{className:"text-gray-600",children:"กำลังโหลด..."})]})}),e.jsx(D,{slot:(a==null?void 0:a.occupied)||[],slotEmpty:(a==null?void 0:a.available)||[],camera:null,map:s,isLabel:!1,handleClick:x})]}),e.jsxs("div",{className:"flex flex-wrap gap-6 mt-4",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:"w-4 h-4 bg-green-500 rounded mr-2"}),e.jsxs("span",{className:"text-mediumGray",children:["ว่าง: ",(a==null?void 0:a.summary.available)||0]})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:"w-4 h-4 bg-red-500 rounded mr-2"}),e.jsxs("span",{className:"text-mediumGray",children:["ไม่ว่าง: ",(a==null?void 0:a.summary.occupied)||0]})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:"w-4 h-4 bg-blue-500 rounded mr-2"}),e.jsxs("span",{className:"text-mediumGray",children:["รวม: ",(a==null?void 0:a.summary.total)||0]})]})]})]}),e.jsx("div",{className:"col-span-12 md:col-span-4",children:e.jsx("div",{className:"flex flex-col gap-2",children:r.map(o=>e.jsx("button",{disabled:f,onClick:()=>i(s,o.summary.location.floor),className:`text-header p-3 rounded transition-colors ${t===o.summary.location.floor?"bg-primary text-white hover:bg-primaryContrast":"bg-gray-100 hover:bg-gray-200"}`,children:e.jsxs("div",{className:"flex justify-between items-center px-2",children:[e.jsxs("span",{children:["ชั้น ",o.summary.location.floor]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"text-lg font-semibold",children:o.summary.available}),e.jsxs("span",{className:"text-sm opacity-75",children:["/ ",o.summary.total]})]})]})},o.summary.location.floor))})})]})})]})};function M(){const{slotStatsAData:s,slotStatsBData:t,filtersA:r,filtersB:f,updateZoneFloor:i,loadingA:x,loadingB:a}=P(),o=d=>{console.log("Clicked slot:",d)};return e.jsx("div",{className:"container mx-auto p-4",children:e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsx(A,{zone:"A",floor:r.floor,slotStatsData:s,loading:x,updateZoneFloor:i,handleClick:o}),e.jsx(A,{zone:"B",floor:f.floor,slotStatsData:t,loading:a,updateZoneFloor:i,handleClick:o})]})})}export{M as default};
