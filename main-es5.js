// HELPERS
'use strict';

function getColor(idx) {
    var colors = ['#6ed6a0', '#5bb8ff', '#6e85ff', '#ff8073', '#ffbe32'];

    return colors[idx % colors.length];
}

function getAvatar(idx) {
    var avatars = ['http://i.imgur.com/kc8uGI4.jpg', 'http://i.imgur.com/D96IPrE.jpg', 'http://i.imgur.com/29unXYe.jpg', 'http://i.imgur.com/I0iaUdD.jpg'];

    return avatars[idx % avatars.length];
}

function conicGradient(from, to) {
    var gradient = new ConicGradient({
        stops: from + ', ' + to,
        size: 120
    });
    return gradient.png;
}

function easing(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
// HELPERS

var meter = new FPSMeter();
var style = document.createElement('style');
style.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(style);

var gradientCache = new Map();
function conicGradientClass(from, to) {
    var className = gradientCache.get(from + to);

    if (!className) {
        var png = conicGradient(from, to);
        className = 'gradient-' + gradientCache.size;

        style.innerHTML += '.' + className + ' { background-image: url(\'' + png + '\'); }\n';

        gradientCache.set(from + to, className);
    }

    return className;
}

function drawLine(path, callback) {
    var length = path.getTotalLength();
    var t = 0;

    path.style.strokeDasharray = length + ' ' + length;

    requestAnimationFrame(function step() {
        t += 1 / 100;
        var offset = -(easing(t) * length);

        if (t >= 1) {
            t = 0;
            requestAnimationFrame(callback);
        }

        path.style.strokeDashoffset = offset;

        requestAnimationFrame(step);

        meter.tick();
    });
}

function changeAvatar(i) {
    var player = avatar.animate([{ transform: 'rotateY(0) translateZ(1px)' }, { transform: 'rotateY(90deg) translateZ(1px)' }], {
        easing: 'ease-in',
        duration: 150
    });

    player.onfinish = function () {
        avatar.style.backgroundImage = 'url(' + getAvatar(i) + ')';

        avatar.animate([{ transform: 'rotateY(90deg) translateZ(1px)' }, { transform: 'rotateY(0deg) translateZ(1px)' }], {
            easing: 'ease-out',
            duration: 150
        });
    };
}

var progressBar = document.querySelector('#progress-path');

function progressBarAnimation() {
    var i = 0;

    function drawContinuous() {
        i++;

        changeAvatar(i);

        var gradientClass = conicGradientClass(getColor(i + 1), getColor(i));
        avatarBox.className = 'avatar-box ' + gradientClass;
    }

    drawLine(progressBar, drawContinuous);
    drawContinuous();
}

// MAIN

var avatarBox = document.querySelector('.avatar-box');
var avatar = document.querySelector('.avatar');

avatar.style.display = 'none';
avatarBox.style.transform = 'scale(0)';

var player = avatarBox.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.25)', offset: 0.9 }, { transform: 'scale(1)', offset: 1 }], {
    easing: 'ease-in-out',
    duration: 400,
    delay: 1000,
    fill: 'forwards'
});

player.onfinish = function () {
    avatar.style.display = 'block';
    player = avatar.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
        easing: 'ease-in-out',
        duration: 200
    });

    player.onfinish = function () {
        progressBarAnimation();
    };
};
