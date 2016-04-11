// HELPERS
function getColor(idx) {
    const colors = ['#6ed6a0', "#5bb8ff", '#6e85ff', "#ff8073", "#ffbe32"];

    return colors[idx % colors.length];
}

function getAvatar(idx) {
    const avatars = ['http://i.imgur.com/kc8uGI4.jpg', 'http://i.imgur.com/D96IPrE.jpg', 'http://i.imgur.com/29unXYe.jpg', 'http://i.imgur.com/I0iaUdD.jpg'];

    return avatars[idx % avatars.length];
}

function conicGradient(from, to) {
    let gradient = new ConicGradient({
        stops: from + ", " + to,
        size: 120
    });
    return gradient.png;
}

function easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
// HELPERS

const style = document.createElement('style');
style.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(style);

const gradientCache = new Map();
function conicGradientClass(from, to) {
    let className = gradientCache.get(from+to);

    if(!className) {
        const png = conicGradient(from, to);
        className = `gradient-${gradientCache.size}`;

        style.innerHTML += `.${className} { background-image: url('${png}'); }\n`;

        gradientCache.set(from+to, className);
    }

    return className;
}

function changeAvatar(i) {
    const player = avatar.animate([
        {transform: 'rotateY(0) scale(1)'},
        {transform: 'rotateY(90deg) scale(0.7)'}
    ], {
        easing: 'ease-in',
        duration: 150
    });

    player.onfinish = () => {
        avatar.style.backgroundImage = 'url(' + getAvatar(i) + ')';

        avatar.animate([
            {transform: 'rotateY(90deg) scale(0.7)'},
            {transform: 'rotateY(0deg) scale(1)'}
        ], {
            easing: 'ease-out',
            duration: 150
        });
    };

}

let currentGradient = null;
const canvas = document.querySelector('.progress-bar');
const ctx = canvas.getContext('2d');
const canvasInfo = {
    center: {
        x: canvas.width/2,
        y: canvas.height/2
    },
    width: canvas.width,
    height: canvas.height
};

function drawProgressBar(deg) {
    const t = deg / 360;
    const newT = easeInOutQuad(t);
    const newDeg = newT * 360;

    const start = ( (-90 + newDeg) / 360) * (Math.PI * 2);
    const end = Math.PI * 1.5;

    ctx.clearRect(0, 0, canvasInfo.width, canvasInfo.height);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(canvasInfo.center.x, canvasInfo.center.y);
    // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
    ctx.arc(canvasInfo.center.x, canvasInfo.center.y, canvasInfo.height / 2, start, end, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvasInfo.center.x, canvasInfo.center.y, canvasInfo.height / 2 - 60, 0, Math.PI * 2, false);
    ctx.fill();
}

function progressBarAnimation() {
    var deg = 0;
    var i = 0;
    let gradientClass = conicGradientClass(getColor(i + 1), getColor(i));
    avatarBox.className = `avatar-box ${gradientClass}`;

    requestAnimationFrame(function drawFrame() {
        deg += 4;
        drawProgressBar(deg);

        if (deg === 360) {
            deg = 0;
            i++;

            changeAvatar(i);

            gradientClass = conicGradientClass(getColor(i + 1), getColor(i));
            avatarBox.className = `avatar-box ${gradientClass}`;
        }

        requestAnimationFrame(drawFrame);
    });

}

// MAIN

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

    player.onfinish = progressBarAnimation;
};

