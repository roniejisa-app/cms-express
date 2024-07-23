const o=t=>t.replace(/(-?\d+([.,]\d+)?)%/g,(n,e)=>parseFloat(e.replace(",",".")).toString()),a=t=>(t=String(t).replaceAll(",",""),t===""?"":new Intl.NumberFormat().format(t));export{a,o as g};
