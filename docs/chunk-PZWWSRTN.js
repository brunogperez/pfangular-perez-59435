import{c,e as f}from"./chunk-MC44LF3H.js";import{a as l}from"./chunk-RM635RE6.js";import"./chunk-52GIBL2D.js";import"./chunk-HNE7D7Y7.js";import{I as M}from"./chunk-IIQQG7MX.js";import{Qa as h,k as u,m as a}from"./chunk-4SWAUFVP.js";import{ma as r,md as s,ra as m,x as p,xa as e}from"./chunk-PWY5XFB5.js";var C=(o,n)=>{let t=m(l),g=m(u);return t.isAdmin().pipe(p(d=>(d||g.navigate(["dashboard","home"]),d)))};var R=[{path:"home",loadChildren:()=>import("./chunk-WVD4LFNW.js").then(o=>o.HomeModule)},{path:"users",canActivate:[C],loadChildren:()=>import("./chunk-IVGAQC6V.js").then(o=>o.UsersModule)},{path:"students",loadChildren:()=>import("./chunk-UZ44CHDS.js").then(o=>o.StudentsModule)},{path:"courses",loadChildren:()=>import("./chunk-UCPLCTBH.js").then(o=>o.CoursesModule)},{path:"inscriptions",loadChildren:()=>import("./chunk-QTPAHXVN.js").then(o=>o.InscriptionsModule)},{path:"**",redirectTo:"home"}],i=class o{static \u0275fac=function(t){return new(t||o)};static \u0275mod=e({type:o});static \u0275inj=r({imports:[a.forChild(R),a]})};var v=class o{static \u0275fac=function(t){return new(t||o)};static \u0275mod=e({type:o});static \u0275inj=r({imports:[s,i,c,f,M,h]})};export{v as DashboardModule};
