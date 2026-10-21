export const KEY_BINDINGS=[
 ['W A S D','移动 / 驾驶'],['鼠标 / 方向键','视角'],['空格','跳跃'],
 ['X / 左 Ctrl','蹲 / 站'],['左键 / F / J','攻击'],['右键 / G','闪身'],
 ['Q','拿物 / 砸人 / 热血'],['E','互动 / 上下车'],['E / Enter','继续对话'],
 ['M','地图'],['B','背包'],['V','股票交易（开户后）'],['K','经营 / 装备'],['C','联系人'],
 ['Y','叫车'],['T','重试目标'],['R','重生 / 返回路边'],['1','吃甜筒'],
 ['Esc','暂停 / 继续'],['地图左键 / 滚轮','拖动 / 缩放']
];

export function setupKeybindings(doc){
 const $=id=>doc.querySelector('#'+id),panel=$('keybindingsPanel'),button=$('keybindingsToggle'),closeButton=$('keybindingsClose');
 const split=Math.ceil(KEY_BINDINGS.length/2);
 $('keybindingsGrid').innerHTML=[KEY_BINDINGS.slice(0,split),KEY_BINDINGS.slice(split)].map(rows=>
  '<table><thead><tr><th>按键</th><th>动作</th></tr></thead><tbody>'+rows.map(([key,action])=>'<tr><td><kbd>'+key+'</kbd></td><td>'+action+'</td></tr>').join('')+'</tbody></table>'
 ).join('');
 function open(){panel.classList.remove('hidden');button.setAttribute('aria-expanded','true');closeButton.focus?.();}
 function close(){panel.classList.add('hidden');button.setAttribute('aria-expanded','false');button.focus?.();}
 button.onclick=open;closeButton.onclick=close;
 panel.addEventListener('click',event=>{if(event.target===panel)close();});
 doc.addEventListener('keydown',event=>{
  if(panel.classList.contains('hidden'))return;
  if(event.code==='Escape'){event.preventDefault();event.stopPropagation();close();}
  else if(event.code==='Tab'){event.preventDefault();closeButton.focus?.();}
 });
 return {open,close,get isOpen(){return !panel.classList.contains('hidden');}};
}
