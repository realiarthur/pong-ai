Finally, we have a more or less skilled opponent! But it still can be beaten. The cause of this is the limitation of the gene pool - we have several initial templates that could only be improved. To create a new one, we need to introduce crossing.

## Crossover

The idea of crossing is to randomly mix the weights and biases of two parents to create a new individual, unlike anyone else. As one of my most intelligent work colleagues said,
"Crossing allows children to get out of the local minimum of error function to reach a global one".

In simple terms, mutations can only improve AI skills to a certain point, after which small changes (which the mutation is) can only make them worse.

Crossing, on the contrary, as an unpredictable change, creates a new template which could be closer to the ideal one. After that, mutations could improve it as well. Here is a simplified 2D illustration:

Crossing allows children to get out of the local minimum of error function to reach a global oneThat's why I decided to allow all who survived to spend half of their children's slots to mutate and a half to mix the genes with another who survived.

Of course, the new AI won't necessarily be successful or even able to survive. To increase our chances, we can create two children simultaneously: a random and the opposite. It's a bit like hedging - if the first child takes a particular parameter from one parent, the second child will get it from the other.

"Gene pool hedging": the random (#1) and the opposite (#2) children generate simultaneously
