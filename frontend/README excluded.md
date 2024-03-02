Finally, we have a more or less skilled opponent! But it still can be beaten. The cause of this is the limitation of the gene pool - we have several initial templates that could only be improved. To create a new one, we need to introduce crossing.

## Crossover

The idea of crossing is to randomly mix the weights and biases of two parents to create a new individual, unlike anyone else. As one of my most intelligent work colleagues said,
"Crossing allows children to get out of the local minimum of error function to reach a global one".

In simple terms, mutations can only improve AI skills to a certain point, after which small changes (which the mutation is) can only make them worse.

Crossing, on the contrary, as an unpredictable change, creates a new template which could be closer to the ideal one. After that, mutations could improve it as well. Here is a simplified 2D illustration:

Crossing allows children to get out of the local minimum of error function to reach a global oneThat's why I decided to allow all who survived to spend half of their children's slots to mutate and a half to mix the genes with another who survived.

Of course, the new AI won't necessarily be successful or even able to survive. To increase our chances, we can create two children simultaneously: a random and the opposite. It's a bit like hedging - if the first child takes a particular parameter from one parent, the second child will get it from the other.

"Gene pool hedging": the random (#1) and the opposite (#2) children generate simultaneously

## Some conclusions

Below, I've described a direct way to a result. Of course, it wasn't like that, and here are some notes I had to make.
Take care of the details

### Every environmental parameter can have a huge impact! Here are just a couple of examples:

When I introduced the minimum wall bounce angle, the AI got used to it and lost its ability to react to balls with near-horizontal angles. I added the probability that a wall bounces every fourth ball at an angle below the established minimum - it fixed the problem.
At some point, I mentioned that the AI I had, as a result, didn't cope well with balls that bounce from the upper or lower boundary. The solution was pretty straightforward, but it took me a long time to come up with it.

I thought that as I had already set the minimum wall bounce angle (20 degrees), it should help select those who can handle complicated ball directions up to the maximum possible bounce angles (40 degrees). When I tried to gradually increase the wall minimum bounce angle up to 40 degrees, it gave great results!

### Save the diversity

Initially, I let the AI reproduce at the exact moment it collected a birth threshold of stimulation points. I also prioritised younger AIs to allow them to shift the environment and make it more aggressive to all. "The skilful will survive, no matter what," I thought.
But it was a bad idea! Often, it leads to situations when some "alpha" individual quickly occupies all available slots in the population with its children (more precisely, grandchildren). And it was not always the best of individuals; usually, it was the luckier ones. The final selection result depended on chance, whether the potentially skilled ones were as lucky as the "alpha" and its children.
I decided to wait until 90% of individuals passed the test or died. This made the process longer but made successful selection results more permanent. To speed up the process, I excluded the last 10% of individuals stuck between the success and death thresholds.

### Don't micro-manage

Another pitfall I fell into was trying to force the AI out of what a friend of mine called the "Forrest Gump strategy".
"Follow the Y of the ball, no matter what" is an intuitive and robust strategy. A faulty selection system I described above has often resulted in this strategy surviving with some modifications.
But even if it may be hard to beat, even if some of the Pong AIs I have played use it, it isn't a smart strategy, in my opinion. Besides the cheating nature of it, this strategy has weaknesses in the corners at higher speed.
The smarter strategy is to go to the middle of the table in the offensive phase and try to predict the ball position in the defensive phase. I decided to use stimulation to nurture it:
I encouraged the player to be closer to the middle of the table
I fined players for unnecessary movements

I won't go into too much detail about how I did it, but it didn't help at all because the root cause was in the selection. However, these additional stimulations continued to influence and confuse the AIs when the selection was fixed. I spent a lot of time before I tried turning them off, but when I did, the AIs found the more intelligent strategy by themselves when the speed was high!
I realised there is no need to develop every desired trait. It's better to focus on creating the right environment and then set only what is generally desired and unwanted. For me, it became a profound realisation that went beyond the scope of this article!
