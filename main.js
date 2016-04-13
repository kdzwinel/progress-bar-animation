// HELPERS
function getColor(idx) {
    const colors = ['#6ed6a0', "#5bb8ff", '#6e85ff', "#ff8073", "#ffbe32"];

    return colors[idx % colors.length];
}

function getAvatar(idx) {
    const avatars = ['http://i.imgur.com/kc8uGI4.jpg', 'http://i.imgur.com/D96IPrE.jpg', 'http://i.imgur.com/29unXYe.jpg', 'http://i.imgur.com/I0iaUdD.jpg'];

    return avatars[idx % avatars.length];
}

function cutOutCircle(img) {
    const offscreen = document.createElement('canvas');
    offscreen.width = 300;
    offscreen.height = 300;
    const osCtx = offscreen.getContext('2d');

    //outer ring
    osCtx.beginPath();
    osCtx.arc(offscreen.width / 2, offscreen.height / 2, offscreen.height / 2 + 2, 0, Math.PI * 2, false);
    osCtx.clip();

    //gradient
    osCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);

    //inner ring
    osCtx.fillStyle = 'white';
    osCtx.beginPath();
    osCtx.moveTo(offscreen.width / 2, offscreen.height / 2);
    osCtx.arc(offscreen.width / 2, offscreen.height / 2, offscreen.height / 2 - (offscreen.height / 15), 0, Math.PI * 2, false);
    osCtx.fill();

    return offscreen;
}

const gradientCache = new Map();
function conicGradient(from, to) {
    var gradientImg = gradientCache.get(from+to);

    if(!gradientImg) {
        const gradient = new ConicGradient({
            stops: from + ", " + to,
            size: 120
        });

        gradientImg = cutOutCircle(gradient.canvas);

        gradientCache.set(from+to, gradientImg);
    }

    return gradientImg;
}

function easeInOutQuad(t) {
    return t<.5 ? 2*t*t : -1+(4-2*t)*t;
}
// HELPERS

function changeAvatar(i) {
    let player = avatar.animate([
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
ctx.fillStyle = 'white';

function drawProgressBar(deg) {
    const t = deg/360;
    const newT = easeInOutQuad(t);
    const newDeg = newT * 360;

    const start = ( (-90 + newDeg) / 360) * (Math.PI * 2);
    const end = Math.PI * 1.5;

    ctx.drawImage(currentGradient, 0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2 + 2, start, end, false);
    ctx.fill();
}

function progressBarAnimation() {
    let deg = 0;
    let i = 0;
    currentGradient = conicGradient(getColor(i + 1), getColor(i));

    requestAnimationFrame(function drawFrame() {
        deg += 4;
        drawProgressBar(deg);

        if(deg === 360) {
            deg = 0;
            i++;

            currentGradient = conicGradient(getColor(i + 1), getColor(i));
            changeAvatar(i);
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

