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

document.body.addEventListener('click', function() {
    document.body.classList.toggle('rotate');
});
