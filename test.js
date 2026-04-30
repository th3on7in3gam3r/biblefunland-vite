const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><p class="p"><span class="v" data-sid="1">1</span>Hello <b>world</b> this is a test <span class="v" data-sid="2">2</span>more</p>`);
const container = dom.window.document.querySelector("p");
const markers = Array.from(container.querySelectorAll('.v'));
markers.forEach(marker => {
  const sid = marker.getAttribute('data-sid');
  const wrapper = dom.window.document.createElement('span');
  wrapper.className = 'verse-wrap';
  marker.parentNode.insertBefore(wrapper, marker);
  let curr = marker;
  while (curr) {
    const n = curr.nextSibling;
    if (n && n.nodeType === 1 && n.classList.contains('v')) break;
    wrapper.appendChild(curr);
    curr = n;
  }
});
console.log(container.innerHTML);
