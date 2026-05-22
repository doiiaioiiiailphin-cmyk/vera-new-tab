// vip.js — VIP system, license verification, ads, paywall modal
// All disabled by default; flip feature flags to activate

// VIP system — flip settings.vip=true to enable premium features
function isVip(){return settings.vip===true;}

// License verification — set LICENSE_CHECK_DISABLED=false and point to real backend
var LICENSE_CHECK_DISABLED=true;
function verifyLicense(){if(LICENSE_CHECK_DISABLED)return true;var key=settings._licenseKey;if(!key)return false;return fetch('https://api.vera.example.com/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:key})}).then(function(r){return r.json();}).then(function(d){return d.valid===true;}).catch(function(){return false;});}

// Google AdSense integration — set ADS_ENABLED=true and fill in ad unit IDs
var ADS_ENABLED=false;
var AD_UNITS={sidebar:'',bottom:''};
function initAds(){if(!ADS_ENABLED)return;var s=document.createElement('script');s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';s.async=true;s.crossOrigin='anonymous';document.head.appendChild(s);}
function loadAdUnit(slotId){if(!ADS_ENABLED||!AD_UNITS[slotId])return;var el=document.getElementById('ad-'+slotId);if(!el)return;var ins=document.createElement('ins');ins.className='adsbygoogle';ins.style.display='block';ins.setAttribute('data-ad-client','ca-pub-XXXXXXXXXXXX');ins.setAttribute('data-ad-slot',AD_UNITS[slotId]);el.appendChild(ins);try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}}
// Free users see ads; VIP users skip
function shouldShowAds(){if(!ADS_ENABLED)return false;return !isVip();}
function toggleAds(){var show=shouldShowAds();var sb=document.getElementById('ad-sidebar');var bt=document.getElementById('ad-bottom');if(sb)sb.style.display=show?'':'none';if(bt)bt.style.display=show?'':'none';if(show){loadAdUnit('sidebar');loadAdUnit('bottom');}}

// VIP paywall modal — set VIP_PROMPT_ENABLED=true to activate
var VIP_PROMPT_ENABLED=false;
function openVipModal(){var ov=document.getElementById('vipModalOverlay');if(ov)ov.style.display='flex';}
function closeVipModal(){var ov=document.getElementById('vipModalOverlay');if(ov&&!ov._vipLocked)ov.style.display='none';}
function maybeShowVipPrompt(){if(!VIP_PROMPT_ENABLED||isVip())return;setTimeout(function(){openVipModal();var btn=document.getElementById('vipUpgradeBtn');var cls=document.getElementById('vipModalClose');var ov=document.getElementById('vipModalOverlay');if(btn)btn.disabled=true;if(cls)cls.style.pointerEvents='none';if(ov)ov._vipLocked=true;setTimeout(function(){if(btn)btn.disabled=false;if(cls)cls.style.pointerEvents='';if(ov)ov._vipLocked=false;},3000);},2000);}

// VIP modal event listeners — attached on DOM ready
function bindVipEvents(){
var vipClose=document.getElementById('vipModalClose');if(vipClose)vipClose.addEventListener('click',closeVipModal);
var vipOverlay=document.getElementById('vipModalOverlay');if(vipOverlay)vipOverlay.addEventListener('click',function(e){if(e.target===this&&!vipOverlay._vipLocked)closeVipModal();});
var vipUpgrade=document.getElementById('vipUpgradeBtn');if(vipUpgrade)vipUpgrade.addEventListener('click',function(){closeVipModal();});
}
