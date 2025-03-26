import{a as I,r as s,A as R,u as z,j as e}from"./index-Bluomjo3.js";import{B as M}from"./Breadcrumb-C_-aqw1f.js";import{S as H,C as V,a as q}from"./SearchDisplay-Hgc5dbHY.js";import{C as J}from"./CarInfoDisplay-BTOMC0tr.js";import{C as K,P as Q}from"./Pagination-D6bEGNZS.js";import{B as W,u as X}from"./BaseSocketService-Bl9hlbK-.js";import{g as Y}from"./ImageConfig-BSyY58UR.js";import"./createLucideIcon-BSuAhcd7.js";import"./MapDisplay-UgpScvv1.js";class Z extends W{constructor(){super("api/parkingrecord-active")}}const ee=new Z,G={page:1,limit:6},te=()=>{const{token:v}=I(),t=X(ee,!0),[d,j]=s.useState(!1),[y,n]=s.useState(!0),[f,o]=s.useState(null),[i,g]=s.useState(!1),[k,x]=s.useState(null),[C,S]=s.useState({data:[],meta:{total:0,totalPages:0,page:1,limit:10}}),[_,w]=s.useState({parking_id:"",floor:"",zone:"",slot:"",spot:"",x_coordinate:0,y_coordinate:0,z_coordinate:0}),[r,m]=s.useState(G),c=s.useCallback(async()=>{if(!(t!=null&&t.connected)||!d){o("รอการเชื่อมต่อ...");return}n(!0);try{t.emit("getPage",r,a=>{a.success?(S(a.data),o(null)):o(a.error||"ไม่สามารถโหลดข้อมูลได้"),n(!1)})}catch(a){console.error("Error fetching data:",a),o("เกิดข้อผิดพลาดในการโหลดข้อมูล"),n(!1)}},[t,d,r]),h=s.useCallback(async a=>{if(!(t!=null&&t.connected)||!d){o("รอการเชื่อมต่อ...");return}n(!0);try{t.emit("searchAdmin",a,l=>{l.success?(S(l.data),o(null)):o(l.error||"ไม่สามารถค้นหาข้อมูลได้"),n(!1)})}catch(l){console.error("Error in admin search:",l),o("เกิดข้อผิดพลาดในการค้นหาข้อมูล"),n(!1)}},[t,d]),b=s.useCallback(a=>{x(null);const{page:l,limit:D,...E}=a,F=Object.values(E).some(p=>p!==void 0&&p!==""&&p!==null);g(F);const O=Object.entries(E).reduce((p,[P,N])=>(N===void 0?p[P]=null:N instanceof Date?p[P]=N.toISOString():p[P]=N,p),{}),B={...r,...O,page:1};m(B),F?h(B):c()},[r,h,c]),T=s.useCallback(()=>{g(!1),x(null),m(G),c()},[c]),L=s.useCallback(a=>{x(null);const l={...r,page:a};m(l),i?h(l):c()},[r,i,h,c]),A=async a=>{if(console.log("Fetching slot data:",{slotID:a,token:v}),!v){o("Unauthorized: No token available"),n(!1);return}n(!0);try{const l=await fetch(`${R.baseURL}/parkingslot/${a}`,{method:"GET",headers:{Authorization:`Bearer ${v}`,"Content-Type":"application/json"}});if(!l.ok)throw new Error("Failed to fetch slot data");const D=await l.json();w(D),o(null)}catch(l){console.error("Fetch slot data error:",l),o("เกิดข้อผิดพลาดในการโหลดข้อมูล")}finally{n(!1)}},U=s.useCallback(a=>{x(a),console.log(a),A(a.parkingSlot.parking_id)},[A]),$=s.useCallback(()=>{x(null)},[]),u=s.useCallback(a=>{!i&&a.success&&c()},[c,i]);return s.useEffect(()=>{if(!t)return;const a=()=>{console.log("🔗 Socket connected successfully"),j(!0)},l=()=>{console.log("⚠️ Socket disconnected"),j(!1),o("การเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...")};return t.on("connect",a),t.on("disconnect",l),t.on("recordCreated",u),t.on("recordUpdated",u),t.on("recordRemoved",u),t.on("parkingStatus",u),t.connected&&j(!0),()=>{t.off("connect",a),t.off("disconnect",l),t.off("recordCreated",u),t.off("recordUpdated",u),t.off("recordRemoved",u),t.off("parkingStatus",u)}},[t,u]),s.useEffect(()=>{d&&!i&&c()},[d,i,c]),{loading:y,isConnected:d,error:f,activeData:C,slotData:_,filters:r,isSearchMode:i,selectedCar:k,handleSearch:b,handlePageChange:L,handleClear:T,handleClick:U,handleBack:$}},me=()=>{const[v,t]=s.useState([{header:"เลขทะเบียนรถ",key:"license_id",placeholder:"กรอกเลขทะเบียน",type:"text"},{header:"จังหวัด",key:"province",placeholder:"เลือกจังหวัด",type:"select",options:[]},{header:"เวลาเข้าจอด",key:"timestamp_in",placeholder:"เลือกเวลา",type:"time"},{header:"ยี่ห้อ",key:"vehicle_brand",placeholder:"เลือกยี่ห้อ",type:"select",options:[{label:"Toyota",value:"Toyota"},{label:"Honda",value:"Honda"}]},{header:"สี",key:"vehicle_color",placeholder:"เลือกสี",type:"select",options:[{label:"แดง",value:"แดง"},{label:"ดำ",value:"ดำ"},{label:"เทา",value:"เทา"}]}]),d=z(),{isAuthenticated:j,isLoading:y}=I(),{error:n,activeData:f,filters:o,isSearchMode:i,selectedCar:g,slotData:k,handleSearch:x,handleClear:C,handlePageChange:S,handleClick:_,handleBack:w}=te();return s.useEffect(()=>{!j&&!y&&d("/")},[j,y,d]),s.useEffect(()=>{let r=!0;return fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json").then(m=>m.json()).then(m=>{if(!r)return;const c=m.map(h=>({label:h.name_th,value:h.name_th}));t(h=>h.map(b=>b.header==="จังหวัด"?{...b,options:c}:b))}).catch(m=>{r&&console.error("Error fetching provinces:",m)}),()=>{r=!1}},[]),e.jsxs("div",{className:"flex flex-col gap-4 p-4",children:[e.jsx(M,{pageName:"ค้นหาตำแหน่งจอดรถ"}),!g&&e.jsx(H,{searchConfig:v,onSearch:x,onClear:C,filters:o}),n&&e.jsx("div",{className:"bg-red-100 border border-red-400 text-error px-4 py-3 rounded relative",children:n}),e.jsxs("div",{children:[e.jsx("div",{className:"flex justify-between items-center pb-4",children:e.jsx("div",{className:" text-header",children:i?`ผลการค้นหา (${f.meta.total})`:g?e.jsx(e.Fragment,{children:e.jsxs("button",{onClick:w,className:"flex items-center text-mediumGray hover:text-primary",children:[e.jsx(V,{className:"w-5 h-5 mr-1"}),e.jsx("span",{children:"กลับ"})]})}):`รถที่จอดปัจจุบันทั้งหมด (${f.meta.total})`})}),e.jsx("div",{className:"",children:g?e.jsx("div",{className:"",children:e.jsx(J,{selectedCar:g,slotData:k})}):e.jsx("div",{className:"",children:f.meta.total>0?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:f.data.map(r=>e.jsxs("div",{className:"bg-white rounded-lg p-5 hover:shadow transition-all cursor-pointer flex flex-col items-center relative group",onClick:()=>_(r),children:[e.jsx("div",{className:"w-full h-40 rounded-lg overflow-hidden bg-gray-200",children:e.jsx("img",{src:Y(r.car_image),alt:r.car_image,className:"w-full h-full object-cover object-bottom transition-transform duration-300"})}),e.jsxs("div",{className:"flex flex-col w-full mt-2",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-lg font-semibold text-header",children:r.license_id}),e.jsx("p",{className:"text-base text-mediumGray",children:r.vehicle.province})]}),e.jsxs("div",{className:"flex justify-between w-full mt-2",children:[e.jsx("p",{className:"text-sm text-mediumGray",children:new Date(r.timestamp_in).toLocaleTimeString("th-TH")}),e.jsxs("div",{className:"flex gap-2 transition-opacity",children:[e.jsx("span",{className:"text-sm text-mediumGray group-hover:text-primary",children:"ดูรายละเอียด"}),e.jsx(K,{className:"w-5 h-5 text-mediumGray group-hover:text-primary"})]})]})]})]},r.parking_active_id))}),e.jsx("div",{className:"mt-6",children:e.jsx(Q,{currentPage:Number(o.page)||1,totalPages:Number(f.meta.totalPages)||1,onPageChange:S,totalItems:Number(f.meta.total)||0,itemsPerPage:Number(o.limit)||10})})]}):e.jsxs("div",{className:"flex flex-col items-center justify-center py-12 rounded-lg",children:[e.jsxs("div",{className:" text-mediumGray mb-2 flex items-start gap-2",children:[e.jsx(q,{className:"w-5 h-5"}),"  ",i?"ไม่พบข้อมูลที่ค้นหา":"ไม่มีรถในลานจอด"]}),i&&e.jsxs("div",{className:"text-sm text-gray-400",children:["กรุณาลองค้นหาด้วยเงื่อนไขอื่น หรือ",e.jsx("button",{onClick:C,className:"text-primary hover:underline ml-1",children:"ล้างการค้นหา"})]})]})})})]})]})};export{me as default};
