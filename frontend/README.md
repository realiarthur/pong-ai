# Pong AI: Genetic algorithm in a browser

I was excited when I saw a genetic algorithm in action for the first time and decided to try it myself! Also, for better understanding, I wanted to build a neural network from scratch without using AI libraries, just a little math.
Finally, over this Christmas holiday, I had enough time to "reinvent the wheel". I planned to solve something that can be regarded as a classic task, so I chose the Atari "Pong" concept as it was the first commercially successful video game. In this post, I want to share some notes I made during my journey.
Here is the DEMO of what I've eventually got!
You can play with the AI I've selected or even train your own and compare it to mine.

---

Hello! My name is Arthur Islamov, and I'm the tech lead of Micro Frontends Platform in exness. But today, I want to discuss a completely different topic. Let me describe what I'm going to do here:

### Train AI to play Pong

- using a genetic algorithm
- using a simple, fully connected neural network
- from scratch with no AI libraries
- with digital inputs (pass values to AI, not screenshots)
- which can play both sides
- who is hard to beat
- with UI displaying the player population and the best player
- in a browser (client side)

Yes, in a browser, using JS. There are no code examples in this article, and I don't want to start any holy wars about programming languages here=) As a frontend developer, I am more familiar with using JS. Of course, python's (or another language) math is better for AI.
What is all of this?
If you have never heard of Pong, it is a video game released in 1972 by Atari. The gameplay looks like this picture - two paddles return the ball back and forth. You can play it here.
If you don't know what a fully connected neural network is, you might understand how it works after reading this article because I'll create one from scratch. Otherwise, here is a good video explanation about it.
A genetic algorithm that I will use is an approach that lets the best-in-generation AIs create the next generation with mutations and so on until an acceptable individual is found. The first generation is generated randomly. You can find more information about it on Wikipedia.
Preparation
The first idea that popped into my mind about how to train the AI was to let it play with another AI and let those who win reproduce themselves with mutations and develop robust strategies. However, since the first generation of AIs is generated randomly, not all of them play well. First, we must select those who look promising and better understand the game rules and let their children improve their skills.
To make a proper selection, we need to:
Evaluate the player's behaviour to let them know what we want and don't want from them. The score is not a suitable index for that purpose - we need to introduce a stimulation concept.
Put all players in the same conditions. Selection by training them against each other can be a long process to create the same conditions for all players. It should be a round-robin tournament. Letting them fight with the same enemy in the training area is easier and faster.

Stimulation
It is simple. We will give the player stimulation points for desired behaviour (e.g., bounces) and decrease them for wrong behaviour (e.g., ball miss). And we'll let players collect these points. Those who collect a certain number of points can be considered as one of the parents for the next generation.
Training area
A training area could be presented as a "wall" player (the left-hand player in the screencast below) that bounces balls at random angles. 
Also, setting the minimum angle of the ball bouncing off the wall can increase the selection speed. This could eliminate the chance of luck for those for whom the wall often hits close to the horizontal direction. 
Training room. The "wall" player is on the left-hand side, and the distribution of the AI-controlled players' positions with the highlighted best player is on the right-hand side. A maximum of 50 players are rendered.Gameplay
I won't dwell on the gameplay implementation, but I want to mention one aspect.
In the original Pong, the ball's previous direction is wholly ignored when bouncing, and only the paddle part that bounces the ball is considered. When I realised this, it almost spoiled my plan. It makes the game more enjoyable, but it means that I couldn't use the same ball for the entire player population.
Afterwards, I came up with an idea to train the AIs by sets. Each set contains its ball and players. All sets are almost transparent except the best one, which is gold. It lets you see the distribution of player positions (on the right-hand side of the play table on the screencast) and bounced or missed balls.
Now, everything is ready for the AI. Let's implement it!

---

Neural network
For those familiar with how simple neural networks work, I want to describe only the essentials and below are several comments for those interested.
Summary
Five inputs
– pY describes the AI's player Y position
– bX' and bY describe the current ball position
– cos' and sin describe the current ball direction

– I did not want to train the AIs for different sides, but I wanted it to play well for both. If we take the X-axis's positive direction to be where the player sends the ball and 0 where the player is, this will solve the problem. I used the 'symbol for inputs that aligned with this rule
– coordinates are scaled by the play table size
One hidden layer of four neurons
Two outputs: one to go up and one to go down. Stop if both are active
Weights and biases between -1 and 1
Step activation

My neural network in action. Inputs are on top, and outputs are on the bottom. I use red for negative and green for positive neuron and connection values.

## Details (skip if you are familiar with NN or not interested in how to make it yourself)

If you are wondering what all of these things are, here is my attempt to describe what is needed to build a simple neural network.
Outputs
Let's first imagine what we want to get from our neural network. Original Pong had a rotating knob controller, but I will work with my keyboard-controlled implementation. That means that speed is limited both for humans and the AI, and paddles could be controlled by two signals: "up" and "down". If both are active, nothing should happen.
In that case, we only need two values from the neural network - one for "up" and one for "down". Both could be 0 or 1, which means the button isn't and is pressed, respectively. So, that is our output layer (at the bottom of the screencast). I'll describe how these values are calculated below.
Inputs
Input neurons are represented by values about the player and the ball and describe the game's current state to the next layer for further conclusions. 
in my case, input values could be between -1 and 1 
the AI knows nothing about what all those values mean, and it is its responsibility to figure it out

Hidden layer
Next, we have the hidden layer of four neurons to react to input data and make some conclusions that will be used for final decisions. The optimal number of neurons in the hidden layer is still mysterious to me, and I used the most common advice:
"The optimal size of the hidden layer is usually between the size of the input and the size of the output layers."
All neurons (except inputs here and below) are represented by their calculated output value. In the screencast, you can see that each neuron of the network is connected with each neuron from the previous layer - that means neuron output values are calculated based on the previous layer values using a few more parameters.
Weights
Each connection between neurons is described by its weight. They allow neurons to decide which data from the previous layer should influence its output value by more or less.
in my case, weights are presented by numbers between -1 and 1
negative values are needed to allow neurons to "feel" the difference of specific parameters (e.g., ball position relative to player position) that are necessary for my task
in the screencast, all connections between neurons display (by opacity and colour) the degree of contribution of a neuron from the previous layer:

[value from the previous layer] \* [connection weight]
all these contributions to the neuron's value add up to form a weighted sum

Biases and activation function
All right, we can almost calculate the neurons' output value! Here are only a couple more important things to make our network smarter: biases and activation function.
So, now we have a weighted sum - just a linear transformation of input values, a sum with coefficients. Not so smart! To add decision-making ability to the neuron, we need to add non-linear transformation. The activation function could handle that.
There are many types of activation functions, but since my task is pretty simple and is about binary decisions (press button or not), I'll use the simplest one - "step activation". It is simple: 
if passed value > 0, the output value = 1, else 0
If we pass a weighted sum to our activation function, we can already have some decisions from the neurons. But sometimes, the decision (or neuron activation) should be offset from 0, which we use to compare the passed value. 
Imagine the hypothetical situation when a neuron wants to decide only one thing: if the player is above the middle of the play table. The neuron, of course, needs to take the player's Y position (which is between 0 and 1), but to "feel" the middle, the neuron activation should be offset by 0.5: 
if (playerY - 0.5) > 0, the output value = 1, else 0
In neural networks, such an offset is called neuron bias, and it could be presented as any value between -1 and 1. It helps all neurons make better decisions and, in my case, transforms the step function into a threshold function.
So, finally, we can calculate neuron activations:
if (weighted sum + bias) > 0, the output value = 1, else 0
The value of every neuron in my network is calculated using this rule.
A few more words about weights and biases
Weights and biases are the central part of neural networks. When we mutate our AI, we change these values a bit. "Randomly generated AI" means a neural network with random weights and biases. The whole training process is about finding the correct values for it.
Finally, we can do the first launch!
First launch
We should only set some environmental values. Let the cost of the missing ball and reward for bounce be 1000 and 500 stimulation points, respectively. Also, we should have sufficient first-generation individuals to have some desired traits in the "gene pool" (in weights and biases). Let's set the population size to 5000 individuals and launch the selection.

On the right-hand side is information about the best AI player: its name, which includes its generation number and sibling index, its stimulation score and a picture of its brain function. Also, there are a few buttons to control the current leader. "Watch" means to focus your observation on it rather than switching to those who will overtake him. "Save" means keeping it for later comparisons with other AI or for playing with it - it will be available in the "controller" selects above the play table, near the score. "Mutate" means to create children of the current leader using mutations. "Kill" simply removes the current leader set.
Not so bad! We have about a dozen randomly generated individuals who can succeed in the conditions we have set. Some of them look very promising, but their strategies aren't perfect. However, we'll let them reproduce and improve it! At the same time, selection criteria should get tougher to direct the evolution in the right direction. Of course, I'm too lazy to do it manually, so let's implement the environment.

---

Environment
The idea of the environment is to make it favourable at the beginning and more aggressive when each new generation emerges. This will let us smoothly nurture certain traits on the one hand and allow the AI to adapt to new conditions on the other. The environment should change by itself and let the AIs be born and die by themselves.
To do so, for each condition, we need to set the "current" value, the desired "final" value and a "step" value to increase its influence with each new generation.
The conditions that I'm planning to change are ball "bounce", ball miss as "fail", ball "speed", max "mutation" value, and "wall min" bounce angle.To let the AIs divide automatically, we can set the threshold value of stimulation points (called population "birth" in the screenshot) that the player should collect to prove that it can thrive in the current environment.
We also should set a "death" threshold to get rid of those who could not adapt to make room in the population. It is required because we need to set a population "max" count due to the limitation of our computing resources.
Also, it would be helpful to know the number of AIs who have passed the test out of the survival number in each generation and the total. This information is shown under the "Selection" section.
The gold label here shows the watched generation to identify the leader. It is the last one by default, but it could be switched by clicking on another. Click on the "total" line to watch the whole population.
Другое важное условие. - обеспечить разнообразие изначального генофонда.
Division
At the moment of division, the individual creates its copies with small random mutations (values between -mutation and +mutation current value) for each of its weights. Free space in the population is equally divided among all the survivors' children. 
The stimulation points of the parent are reset, and it can start collecting them again in new conditions. It will allow us to keep good genes, even if the player does not belong to the last generation.
Mutation limit value changes
As you can see in the screenshot, I plan to smoothly decrease the maximum mutation value. It makes mutations more accurate over time. My idea is that when the player is already good, only minor changes are needed to make it perfect.
Now, you can pour yourself a mug of your favourite beverage and enjoy the evolution spectacle.
Video with mutations
Finally, we have a more or less skilled opponent! But it still can be beaten. The cause of this is the limitation of the gene pool - we have several initial templates that could only be improved. To create a new one, we need to introduce crossing.

---

Crossing
The idea of crossing is to randomly mix the weights and biases of two parents to create a new individual, unlike anyone else. As one of my most intelligent colleagues said,
"Crossing allows children to get out of the local minimum of error function to reach a global one".
In simple words, mutations can only improve AI skills to a certain point, after which small changes (which the mutation is) can only make them worse.
Crossing, on the contrary, as an unpredictable change, creates a new template which could be closer to the ideal one. After that, mutations could improve it as well. Here is a simplified 2D illustration:
Crossing allows children to get out of the local minimum of error function to reach a global oneThat's why I decided to allow all who survived to spend half of their children's slots count to mutate and half to cross with another who survived.
Of course, the new AI won't necessarily be successful or even able to survive. To increase our chances, we can create two children simultaneously: a random and the opposite. It's a bit like hedging - if the first child takes a particular parameter from one parent, the second child will get it from the other.
"Gene pool hedging": the random (#1) and the opposite (#2) children generate simultaneouslyLet's start the final selection session!
Video with crossing
Now, it looks like a professional goalkeeper! This is the result that will satisfy me for now! Of course, AI now knows only how not to lose and has no attack strategies. As I mentioned at the beginning of the article, I think it is possible to develop attack skills by training AI by playing with other AI. 
Maybe someday I'll implement this "round-robin tournament genetic algorithm". Each player of the population selected in this article could be a proud participant.

---

Some conclusions
Below, I've described a direct way to a result. Of course, it wasn't like that, and here are some notes I had to make.
Take care of the details
Every environmental parameter can have a huge impact! Here are just a couple of examples:
When I introduced the minimum wall bounce angle, AI got used to it and lost its ability to react to balls with near-horizontal angles. I added the probability that a wall bounces every fourth ball at an angle below the established minimum - it fixed the problem.
At some point, I mentioned that the AI I had, as a result, didn't cope well with balls that bounce from the upper or lower boundary. The solution was pretty straightforward, but it took me a long time to come up with it.

I thought that as I had already set the minimum wall bounce angle (20 degrees), it should help select those who can handle complicated ball directions up to the maximum possible bounce angles (40 degrees). When I decided to try to smoothly increase the wall minimum bounce angle up to 40 degrees, it gave great results!

Save the diversity
Initially, I let the AI reproduce at the exact moment it collected a birth threshold of stimulation points. I also prioritised younger AIs to allow them to shift the environment and make it more aggressive to all. "The skilful will survive, no matter what," I thought.
But it was a bad idea! Often, it leads to situations when some "alpha" individual quickly occupies all available slots in the population with its children (more precisely, grandchildren). And it was not always the best of individuals; usually, it was the luckier ones. The final selection result depended on chance, whether the potentially skilled ones were as lucky as the "alpha" and its children.
I decided to wait until all 90% of individuals passed the test or died. This made the process longer but made successful selection results more permanent. To speed up the process, I excluded the last 10% of individuals stuck between the success and death thresholds.
Don't micro-manage
Another pitfall I fell into was trying to force the AI out of what a friend of mine called the "Forest Gump strategy".
"Follow the Y of the ball, no matter what" is an intuitive and robust strategy. A faulty selection system I described above has often resulted in this strategy surviving with some modifications.
But even if it may be hard to beat, even if some of the Pong AIs I have played use it, it isn't a smart strategy, in my opinion. Besides the cheating nature of it, this strategy has weaknesses in the corners at higher speed.
The smarter strategy is to go to the middle of the table in the offensive phase and try to predict the ball position in the defensive phase. I decided to use stimulation to nurture it:
I encouraged the player to be closer to the middle of the table
I fined players for unnecessary movements

I won't fall into details of how I did it, but it didn't help at all because the root cause was in the selection. However, these additional stimulations continued to influence and confuse the AIs when the selection was fixed. I spent a lot of time before I tried to turn them off, but when I did, AIs found the more intelligent strategy by themselves when speed was up!
I realised there is no need to develop every desired trait. It's better to focus on creating the right environment and then tell only what is generally desired and unwanted. For me, it became a profound realisation that went beyond the scope of this article!
