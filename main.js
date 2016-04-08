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

function conicGradient(el) {
    const maskA = el.querySelector('.partA');
    const maskB = el.querySelector('.partB');
    const startDeg = 90;

    for (let i = 1; i < 360; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', 55);
        rect.setAttribute('height', 55);
        rect.setAttribute('fill', makeRGBA(i));
        rect.setAttribute('transform', 'rotate(' + ( startDeg + i) + ' 55 55)');

        if (i > startDeg + 180) {
            maskB.appendChild(rect);
        } else {
            maskA.appendChild(rect);
        }
    }
}

function drawLine(path) {
    const length = path.getTotalLength();

    path.style.transition = path.style.WebkitTransition = 'none';
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = length;
    path.getBoundingClientRect();
    path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset 1.5s ease-in-out';
    path.style.strokeDashoffset = '0';
}

function changeAvatar(i) {
    let player = avatar.animate([
        {transform: 'rotateY(0) scale(1)'},
        {transform: 'rotateY(90deg) scale(0.7)'}
    ], {
        easing: 'ease-in',
        duration: 150
    });

    player.onfinish = () => {
        document.querySelector('.avatar').style.backgroundImage = 'url(' + getAvatar(i) + ')';

        avatar.animate([
            {transform: 'rotateY(90deg) scale(0.7)'},
            {transform: 'rotateY(0deg) scale(1)'}
        ], {
            easing: 'ease-out',
            duration: 150
        });
    };

}

const progressBar = document.querySelector('.progress-bar');
const background = progressBar.querySelector('.background');
const backgroundTo = background.children[0];
const backgroundFrom = background.children[1];
const path = progressBar.querySelector('#progressPath path');

function progressBarAnimation() {

    let i = 0;

    function drawContinous() {
        i++;

        changeAvatar(i);

        backgroundTo.style.fill = getColor(i + 1);
        backgroundFrom.style.fill = getColor(i);

        drawLine(path);
    }

    path.addEventListener('transitionend', drawContinous);
    drawContinous();
}

// MAIN

progressBar.style.display = 'none';

conicGradient(progressBar);

const avatarBox = document.querySelector('.avatar-box');

const avatar = document.querySelector('.avatar');
avatar.style.display = 'none';

avatarBox.style.transform = 'scale(0)';

let player = avatarBox.animate([
    {transform: 'scale(0)'},
    {transform: 'scale(1.25)', offset: 0.9},
    {transform: 'scale(1)', offset: 1}
], {
    easing: 'ease-in-out',
    duration: 400,
    delay: 1000,
    fill: 'forwards'
});

player.onfinish = () => {
    avatar.style.display = 'block';
    player = avatar.animate([
        {transform: 'scale(0)'},
        {transform: 'scale(1)'}
    ], {
        easing: 'ease-in-out',
        duration: 200
    });

    player.onfinish = () => {
        progressBar.style.display = 'block';
        progressBarAnimation();
    };
};

