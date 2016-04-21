# progress-bar-animation

## Design
I'm working on a new user profile component for my company. One of its elements is a combination of an avatar and a progress bar. First design that I got from our graphic design team looked like this:

![design](http://i.imgur.com/9HMJrVJ.png)

## Research
Rounded avatar and a white buble in the background can be easly created with CSS. Progres bar is definitely the most chalenging element. I considered three ways of building it:
- CSS,
- canvas and
- SVG.

Looking through the different CSS pie chart implementations I decided that CSS is not fitted for the job. All solutions were hacks that would be hard to control. I was also woried that it will be cumbersome to make it work on all the browsers that we support. Canvas, with almost universal support, seemed more appealing. However, canvas would require me to implement timing (e.g. easing functions) and scaling (to support higher dpis) myself. Besides, I though that it would not utilize GPU as well as CSS transitions/transforms. SVG seemed like the best of both worlds: it's universally supported, doesn't need any hacks to create a required shape, utilizes CSS transitions to create animations and fits all screen dpis out of the box. So, I dusted off my SVG knowledge and started coding.

## Prototype (`master` branch)
First prototype was ready in couple of hours and it looked like this:

![prototype](http://i.imgur.com/IwMzrfm.png)

Happy with the result, I sprinkled it with some CSS magic and made a short [video](https://www.youtube.com/watch?v=CJpnURd2xw8) showing it in action.

Everything, besides the progress bar, was done in HTML/CSS. Animation of the progress bar was powered by [Jake Archibald's animated line drawing technique](https://jakearchibald.com/2013/animated-line-drawing-svg/).

![how it's built](http://i.imgur.com/Zh3IW5v.png)

On my way home from work I realized that I haven't yet looked at the performance of that component. I also remembered that during last Chrome Dev Summit someone mentioned that Chromes SVG implementation is dated and not especially performant. That made me fear for the worst. On the next day, I opened the prototype on my HTC One and, sure enough, saw a choppy animation. I debugged it remotely and got this timeline:

![prototype - timeline](http://i.imgur.com/xsuGfvD.png)

(For these unfamiliar with DevTools Timeline - red marks point out lost frames and the FPS graph should, ideally, be all green and flat.)

And so I started looking for optimizations.

## Conic gradient (`svg-image` branch)

Progress bar is using conic gradient in the background. Since this type of gradient is not supported natively in SVG (nor CSS), I had to generate it myself (with SVG and JS). My soltuion turned out to be suboptimal. Using paint profiler I found out that gradient is regenerated in each frame (which is a lot of unnecesarry work):

![paint profiler FTW](http://i.imgur.com/QJlJ3hu.png)

My fix was to generate each background once and use animated SVG mask to reveal it.

```
    <svg>
      <defs>
          <mask id="progressPath">
            <path d="..."/>
          </mask>
      </defs>

      <image class="background" width="110" height="110" xlink:href="..." mask="url(#progressPath)"/>
    </svg>
```

This time I used [Lea Verou's conic gradient polyfill](https://leaverou.github.io/conic-gradient/) to generate PNGs for me.

That helped a bit, but animation was still far from smooth (in fact, it was so far from smooth that android dev who walked by my desk haven't missed a chance to mock it). I decided to discuss it with my colleague who showed me how to get rid of masking (that we assumed was expensive).

### Masking (`reverse` branch)

Instead of masking, he suggested putting gradient background on the element behind the progress bar. This required me to modify the SVG animation, but made the whole solution much simpler (compare image below with the similar image from the "prototype" section).

![animation simplified](http://i.imgur.com/N0q0UcH.png)

In the process I also learned that setting base64 background directly on the element using `el.style.backgroundImage` has poor performance (possibly due to parsing) so, instead, I generated CSS classes for each gradient on the fly.

Additionally, to reduce the time browser spends on painting, we forced it (via `translateZ`/`will-change`) to promote avatar and SVG to separate layers.

After all these optimizations (and numerous hours) the result was still rather disapointing:

![loosing frames here and there](http://i.imgur.com/oZEedwu.png)

Two biggest offenders were rasterization and compositing.

### Loosing faith in SVG (`minimal` branch)

I figured out that maybe it's all because I'm using web animation API? Or maybe because I use flexbox? Maybe because I'm doing two animations at once? Maybe it's all gradient's fault? So I started removing things one by one. Eventually, I ended up with 15 lines of HTML/SVG, 25 lines of CSS and no JS. That's how the simplifed animation looked:

![as simple as that](http://i.imgur.com/6ZPAKGZ.png)

And that's a timeline of this, absolutely minimal, animation on my Android device:

![SVG and animations - the sad truth](http://i.imgur.com/6ABX4Ij.png)

(╯°□°)╯︵ ┻━┻

### Canvas (`canvas` branch)

I quickly rebuilt the whole thing using canvas. There is much more JS magic going on, but rasterization is no longer an issue and animation feels waaay smoother. It still isn't perfect, compositing steals a frame once in a while, but I'm much closer to the final version.

![canvas](http://i.imgur.com/c8IClLc.png)

## Summary

I love SVG. It's elegant, scalable and works everywhere. It's perfect for mobile... as long as it doesn't move. There is no way to animate it smoothly on Android - rasterization won't give you a chance:

![try to fit this in you ~16ms budget](http://i.imgur.com/EfeuTsw.png)

On desktop even the unoptimized version of my animation works smoothly simply because there are multiple rasterization threads:

![rasterization on desktop](http://i.imgur.com/quzQjiC.png)

During last Chrome Dev Summit, Chrome team promised to step up their SVG game. I really hope that this will happen soon. In my opinion, SVG is a natural fit for creating complex animations on the web.

Meanwhile, I'll probably go with the canvas solution. It puts much more work on JS, but has a decent performance, is universally supported and, with a bit of work, I can make it look sharp on all dpis.

## Follow-up

Paul Irish did a very insigtfull [performance review](https://github.com/kdzwinel/progress-bar-animation/issues/1) of the SVG version of my animation. Unfortunately, he haven't found any significant improvements.

---

I made a safari & edge friendly version of the "reverse" branch (see [reverse-es5](https://github.com/kdzwinel/progress-bar-animation/tree/reverse-es5)), added [FPSMeter](http://darsa.in/fpsmeter/) and tested it side by side on Nexus 5X, iPhone5S, Lumia 735. Here is the result:

[![running side by side](http://i.imgur.com/yUXHw7s.png)](https://youtu.be/cg2CQt3RS-k)

It's hard to tell if this test is fair since these phones have completely different specs. On the other hand, these are all modern devices and run lastest versions of the browsers, so I'd expect all of them to show this animation at the smooth 60FPS.

---

Before making final decision I decided to also test CSS version of the animation (see `css` branch). As I thought, it turned out to be one big hack that's hard to work with. Also, since the implementation uses two separate elements that have to be synced, making non-linear easing would be challenging. Taking these issues into consideration, despite the fact that it was the most performant solution out of three I tested, I made the decision to stick with canvas.

---

Based on the above research I created a simple library wrapping my canvas implementation: https://brainly.github.io/ui-components/components/doughnut-progress-bar/ . We ended up using on production to create this little widget:

![(almost) final product](https://i.imgur.com/K6o7jm0.gif)
