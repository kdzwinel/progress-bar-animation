# progress-bar-animation

## Design
I'm working on a new user profile component for my company. One of its elements is a combination of an avatar and a progress bar. First design that I got from our graphic design team looked like this:

![design](http://i.imgur.com/9HMJrVJ.png)

## Prototype (`master` branch)
After quick research, I dusted off my SVG knowledge and started coding. First prototype was ready in couple of hours and it looked like this:

![prototype](http://i.imgur.com/IwMzrfm.png)

Happy with the result, I sparkled it with some CSS magic and made a short [video](https://www.youtube.com/watch?v=CJpnURd2xw8) showing it in action.

Everything, besides the progress bar, was done in HTML/CSS. Animation of the progress bar was powered by [Jake Archibald's animated line drawing technique](https://jakearchibald.com/2013/animated-line-drawing-svg/).

![layers](http://i.imgur.com/vvNi0SC.png)

On my way home from work I realized that I haven't yet looked at the performance of that component. I also remembered that during last Chrome Dev Summit someone mentioned that Chromes SVG implementation is dated and not especially performant. That made me fear for the worst. On the next day, I opened the prototype on my HTC One and, sure enough, saw the choppy animation. I debugged it remotely and got this timeline:

![prototype - timeline](http://i.imgur.com/xsuGfvD.png)

And so I started optimizing.

## Conic gradient (`svg-image` branch)

Progress bar is using conic gradient in the background. Unfortunately, it's not available natively in SVG (nor CSS), so I had to generate it with a bit of SVG and JS. Thanks to the paint profiler I found out that SVG regenerates the whole thing with each frame:

![paint profiler FTW](http://i.imgur.com/QJlJ3hu.png)

Since it's a lot of unnecessary work, I decided to generate each background once and use animated SVG mask to reveal it.

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
It helped a bit, but animation was still far from smooth (so visibly far from smooth that android dev who walked by my desk haven't missed a chance to mock it). I decided to discuss it with my colleague who showed me how to get rid of masking (that we assumed was expensive).

### Masking (`reverse` branch)

Instead of masking, he suggested putting gradient background on the lower element, limiting SVG to a simple path animation (compare image below with the similar image from the "prototype" section).

![animation simplified](http://i.imgur.com/pj4hSPE.png)

In the process I also learned that setting base64 background directly on the element using `el.style.backgroundImage` has poor performance and, instead, I generated and used CSS classes.

Additionally, to reduce the time browser spends on painting, we forced it (via `will-change`) to promote avatar and SVG to separate layers.

After all these optimizations (and numerous hours) the result was still rather disapointing:

![loosing frames here and there](http://i.imgur.com/oZEedwu.png)

Still a lot of pressure on rasterization and, additionally, on composing.

### Loosing faith in SVG (`minimal` branch)

I figured out that maybe it's all because I'm using web animation API? Or maybe because I use flexbox? Maybe because I'm doing two animations at once? Maybe it's all gradient's fault? So I started removing. I ended up with 15 lines of HTML/SVG and 25 lines of CSS (I got rid of JS completely). That's how it looked:

![Can't be more simple](http://i.imgur.com/6ZPAKGZ.png)

And that's a timeline of this, absolutely minimal, animation on my Android device:

![SVG and animations - sad truth](http://i.imgur.com/6ABX4Ij.png)

(╯°□°)╯︵ ┻━┻

### Canvas (`canvas` branch)

I quickly rebuilt the whole thing using canvas. Rasterization is no longer an issue and animation feels waaay better. I'm still fighting with layer composition though.

![canvas](http://i.imgur.com/c8IClLc.png)

## Summary

I love SVG. It's elegant, scalable and works everywhere. It's perfect for mobile... as long as it doesn't move. There is no way to animate it smoothly on Android - rasterization won't give you a chance:

![that's how hell looks like](http://i.imgur.com/EfeuTsw.png)

On the Chrome Dev Summit, Chrome team promised to step up their SVG game - I really hope this will happen soon.

Meanwhile, I'll probably go with the canvas solution. It puts much more work on JS, but has a decent performance, is universally supported and, with a bit of work, I can make it look sharp on all screens. If, for some reason, canvas won't be good enough I'll consider CSS solution (which is the most dirty one in this case).
