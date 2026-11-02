import type { Subject } from "@/lib/course/types";

export const models: Subject = {
  id: "models",
  title: "Models",
  blurb: "What a fit is doing, and what a deep network is not promising.",
  topics: [
    {
      id: "fitting",
      title: "Fitting",
      summary: "Bias, variance, and the gap between the training set and new examples.",
      levels: [
        {
          id: "bias-variance",
          title: "Bias and variance",
          hearts: 3,
          xp: 20,
          rounds: [
            {
              kind: "concept",
              id: "idea",
              title: "Bias or variance",
              body: "Fit the same kind of model to many training sets from one population. Bias is the average prediction sitting away from the truth. Variance is the predictions scattering from one training set to the next.",
            },
            {
              kind: "question",
              id: "scatter",
              prompt:
                "The predictions scatter widely, but their average is close to the true value. What is that?",
              choices: [
                { id: "variance", text: "High variance" },
                { id: "bias", text: "High bias" },
                { id: "both", text: "High bias and high variance" },
              ],
              answerId: "variance",
              explain:
                "The average is close to the truth, so the bias is small. The wide scatter from set to set is the variance.",
            },
            {
              kind: "question",
              id: "steady",
              prompt:
                "Every training set gives almost the same prediction, and that prediction sits far from the true value. What is that?",
              choices: [
                { id: "bias", text: "High bias" },
                { id: "variance", text: "High variance" },
                { id: "noise", text: "A noisy test set" },
              ],
              answerId: "bias",
              explain:
                "The predictions agree with each other, so the variance is small. They agree on the wrong value, so the bias is high.",
            },
          ],
        },
        {
          id: "overfitting",
          title: "Overfitting",
          hearts: 3,
          xp: 20,
          rounds: [
            {
              kind: "concept",
              id: "idea",
              title: "The training gap",
              body: "A low error on the training set only says the model fit those examples. The job is new examples from the same distribution. A large gap between the two is overfitting.",
            },
            {
              kind: "question",
              id: "gap",
              prompt:
                "A model has almost no error on its training set, and a much larger error on new examples from the same distribution. What has gone wrong?",
              choices: [
                { id: "fit", text: "It fit details that do not hold for new examples" },
                { id: "under", text: "It is underfitting the training set" },
                { id: "shift", text: "The new examples must come from a different problem" },
              ],
              answerId: "fit",
              explain:
                "The examples are from the same distribution. The model memorized the training set, so the training error stopped being a guide to new examples.",
            },
            {
              kind: "question",
              id: "trust",
              prompt: "You want the model to work on new examples. Which error do you trust?",
              choices: [
                { id: "held", text: "The error on examples it did not train on" },
                { id: "train", text: "The training error, because those examples were seen" },
                { id: "small", text: "Whichever of the two numbers is smaller" },
              ],
              answerId: "held",
              explain:
                "The training error can be made small by memorizing. The error on held-out examples is the one that speaks to new data.",
            },
          ],
        },
      ],
    },
    {
      id: "networks",
      title: "Networks",
      summary: "What a zero gradient means, and why a deep sigmoid can go quiet.",
      levels: [
        {
          id: "stationary",
          title: "A zero gradient",
          hearts: 3,
          xp: 20,
          rounds: [
            {
              kind: "concept",
              id: "idea",
              title: "Stopped, not best",
              body: "A zero gradient means the weights are a stationary point. A neural network loss is not convex, so that point can be a local minimum, a local maximum, or a saddle. It is not proof of the best weights.",
            },
            {
              kind: "question",
              id: "claim",
              image: {
                src: "/course/stationary.svg",
                alt: "A loss curve that flattens where the slope is zero, then falls again",
              },
              prompt:
                "Training stops and the gradient is the zero vector. A classmate says those weights are the best possible. What is wrong?",
              choices: [
                { id: "stationary", text: "A zero gradient is only a stationary point" },
                { id: "right", text: "Nothing. Gradient descent only stops at the best weights" },
                { id: "zero-loss", text: "The loss must be zero wherever the gradient is" },
              ],
              answerId: "stationary",
              explain:
                "The loss can bend up and down. Stopping where the slope is zero does not mean every other set of weights is worse.",
            },
            {
              kind: "question",
              id: "convex",
              prompt: "Why can a smooth convex loss make a stronger promise?",
              choices: [
                { id: "global", text: "Gradient descent can reach a global minimum" },
                { id: "flat", text: "A convex loss has no derivatives" },
                { id: "start", text: "A convex loss is already zero at the start" },
              ],
              answerId: "global",
              explain:
                "On a smooth convex function the stationary point is a global minimum, so reaching it is reaching the best value. A network loss does not have that shape.",
            },
          ],
        },
        {
          id: "vanishing",
          title: "Vanishing gradients",
          hearts: 3,
          xp: 20,
          rounds: [
            {
              kind: "concept",
              id: "idea",
              title: "A small factor",
              body: "The derivative of a sigmoid is at most one quarter. Backpropagation multiplies one such factor for each layer. In a deep stack that product becomes tiny, so the first layer barely moves.",
            },
            {
              kind: "question",
              id: "deeper",
              prompt:
                "The first layer's gradient is almost zero, and the last layer still gets a usable one. Why do more sigmoid layers make this worse?",
              choices: [
                { id: "product", text: "Each layer multiplies in another factor of at most 1/4" },
                { id: "rate", text: "A deeper network always uses a larger learning rate" },
                { id: "stop", text: "The last layer stops sending any gradient" },
              ],
              answerId: "product",
              explain:
                "The last layer still has a gradient. The first layer's update is that gradient times a small sigmoid derivative for every layer in between.",
            },
            {
              kind: "question",
              id: "move",
              prompt: "A tiny gradient reaches the first layer. What happens to those weights?",
              choices: [
                { id: "barely", text: "They barely change" },
                { id: "jump", text: "They jump to a global minimum" },
                { id: "done", text: "The loss is already zero, so they are finished" },
              ],
              answerId: "barely",
              explain:
                "The update is the learning rate times the gradient. A near-zero gradient is a near-zero step, so the first layer stays almost where it was.",
            },
          ],
        },
      ],
    },
    {
      id: "steps",
      title: "Steps",
      summary: "How a gradient step is written.",
      levels: [
        {
          id: "update",
          title: "The update",
          hearts: 3,
          xp: 20,
          rounds: [
            {
              kind: "concept",
              id: "idea",
              title: "One step",
              body: "A gradient step moves the weights by a small multiple of the slope. With learning rate $\\eta$ and gradient $g = \\nabla L(\\theta)$, the next weights are $$\\theta \\leftarrow \\theta - \\eta g.$$ The minus sign walks downhill.",
            },
            {
              kind: "question",
              id: "rate",
              prompt: "In $\\theta \\leftarrow \\theta - \\eta g$, what does a larger $\\eta$ do?",
              choices: [
                { id: "scale", text: "It takes a longer step along $g$" },
                { id: "flip", text: "It changes the direction of $g$" },
                { id: "zero", text: "It sets $\\theta$ to $0$" },
              ],
              answerId: "scale",
              explain: "$\\eta$ only scales the step. The direction stays $-g$.",
            },
            {
              kind: "question",
              id: "grad",
              prompt: "Which expression is $\\nabla L$ for $L(\\theta) = (\\theta - 3)^2$?",
              choices: [
                { id: "twice", text: "$2(\\theta - 3)$" },
                { id: "square", text: "$(\\theta - 3)^2$" },
                { id: "plain", text: "$\\theta - 3$" },
              ],
              answerId: "twice",
              explain:
                "The derivative of $u^2$ is $2u$, and here $u = \\theta - 3$. So $\\nabla L(\\theta) = 2(\\theta - 3)$.",
            },
          ],
        },
      ],
    },
  ],
};
