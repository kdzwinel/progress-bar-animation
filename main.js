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

function conicGradient(from, to) {
    let gradient = new ConicGradient({
        stops: from + ", " + to,
        size: 120
    });
    return gradient.png;
}
// HELPERS

const style = document.createElement('style');
style.type = 'text/css';
document.getElementsByTagName('head')[0].appendChild(style);

const gradientCache = new Map();
function conicGradientClass(from, to) {
    let className = gradientCache.get(from + to);

    if (!className) {
        const png = conicGradient(from, to);
        className = `gradient-${gradientCache.size}`;

        style.innerHTML += `.${className} { background-image: url('${png}'); }\n`;

        gradientCache.set(from + to, className);
    }

    return className;
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

const doughnut = document.querySelector('.doughnut');
const avatar = document.querySelector('.avatar');
const circles = doughnut.querySelectorAll('.circle');
const leftCircle = circles[0];
const rightCircle = circles[1];
let i = 0;

function nextStep() {
    i++;

    changeAvatar(i);
    leftCircle.className = 'circle ' + conicGradientClass(getColor(i), getColor(i + 1));
    rightCircle.className = 'circle ' + conicGradientClass(getColor(i), getColor(i + 1));

    let player = rightCircle.querySelector('.rotor').animate([
        {
            transform: 'rotate(0deg) translateZ(1px)'
        },
        {
            transform: 'rotate(180deg) translateZ(1px)'
        }
    ], {
        easing: 'ease-in',
        fill: 'forwards',
        duration: 750
    });

    player.onfinish = () => {
        player = leftCircle.querySelector('.rotor').animate([
            {
                transform: 'rotate(-180deg)'
            },
            {
                transform: 'rotate(0deg)'
            }
        ], {
            easing: 'ease-out',
            duration: 750
        });

        player.onfinish = nextStep;
    };
}

nextStep();