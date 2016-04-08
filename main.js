// HELPERS
function makeRGBA(degree) {
    let ratio = 0.8 - (degree / 360);
    const colorVal = Math.floor(255 * ratio);
    const colorArray = [colorVal, colorVal, colorVal];

    return 'rgba(' + colorArray.join(',') + ',1)';
}

function getColor(idx) {
    const colors = ['#6ed6a0', "#5bb8ff", '#6e85ff', "#ff8073", "#ffbe32"];

    return colors[idx % colors.length];
}

function getAvatar(idx) {
    const avatars = ['http://i.imgur.com/kc8uGI4.jpg', 'http://i.imgur.com/D96IPrE.jpg', 'http://i.imgur.com/29unXYe.jpg', 'http://i.imgur.com/I0iaUdD.jpg'];

    return avatars[idx % avatars.length];
}
// HELPERS

const pieLeft = document.querySelector('.pie .slice-left');
const pieRight = document.querySelector('.pie .slice-right');

let player = pieRight.animate([
    {webkitClipPath: 'rect(0, 50%, .5em, .5em)', opacity: 0},
    {webkitClipPath: 'rect(0, 1em, .5em, .5em)', opacity: 1, offset: 0.5},
    {webkitClipPath: 'rect(0, 1em, 1em, .5em)', opacity: 0, offset: 1}
], {
    easing: 'ease-in',
    duration: 300,
    delay: 1000,
    fill: 'forwards'
});

player.onfinish = () => {
    pieLeft.animate([
        {webkitClipPath: 'rect(.5em, .5em, 1em, .5em)'},
        {webkitClipPath: 'rect(.5em, .5em, 1em, 0)', offset: 0.5},
        {webkitClipPath: 'rect(.3em, .5em, 1em, 0)', offset: 1}
    ], {
        easing: 'ease-out',
        duration: 300,
        fill: 'forwards'
    });
};

