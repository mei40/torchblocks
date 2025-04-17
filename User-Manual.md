User Manual

## Introduction

TorchBlocks is a visual neural network builder that allows you to
create, visualize, and export PyTorch neural networks without writing
code. This user manual will guide you through the interface and
functionality of the application.

## Main Interface

The TorchBlocks interface consists of:

- Header: Contains the application title and buttons for running tests,
  saving, and exporting models

- Sidebar: Shows available components that can be dragged onto the
  canvas

- Main Canvas: Where you build and visualize your neural network

- Property Panel: Displays and allows editing of the properties of
  selected components

- View Toggle: Allows switching between different visualization modes
  (Blocks, Layers, Neurons, Test Results)

## Blocks View

The Blocks view is the primary interface for building neural networks.
It provides a drag-and-drop environment where you can place and connect
different neural network components.

### Sidebar

The sidebar contains all available components organized by category:

- Special: Input and Output nodes

- Datasets: Data sources like MNIST

- Layers: Building blocks like Linear and Conv2D layers

- Activations: Functions like ReLU and Sigmoid

- Loss Functions: Components like CrossEntropyLoss and MSELoss

- Optimizers: Options like Adam and SGD

To use a component:

1.  Click and drag it from the sidebar onto the canvas

2.  Release to place it at the desired position

### Canvas

The canvas is where you build your neural network by:

- Adding Components: Drag components from the sidebar onto the canvas

- Creating Connections: Click and drag from an output handle (right
  side) to an input handle (left side) of another component

- Selecting Components: Click on a component to select it and view its
  properties

- Moving Components: Click and drag to reposition components

- Deleting Components: Drag unwanted components to the trash icon at the
  bottom left

- Deleting Connections: Select a connection and press Delete, or use the
  Delete button that appears when a connection is selected

Controls at the bottom left allow you to:

- Pan the canvas

- Zoom in and out

- Fit the view to show all components

A mini-map in the bottom right corner provides an overview of your
network layout.

### Property Panel

The property panel appears on the right side when a component is
selected. It allows you to:

- View the component type and label

- Edit parameters specific to the component type

- Apply changes to update the component

For example, with a Linear Layer selected, you can modify:

- Input Features

- Output Features

- Bias settings

After making changes, click the \"Apply Changes\" button to update the
component.

## Layers View

The Layers view provides a higher-level visualization of your neural
network structure. It shows:

- The network as a sequence of connected layers

- The number of neurons/features in each layer

- Activation functions present in each layer

When you click on a layer, additional details appear in a panel below,
including:

- Layer type (Input, Hidden, Output)

- Neuron/feature count

- Details of the blocks that make up this layer

This view is helpful for understanding the overall architecture of your
neural network.

## Neurons View

The Neurons view provides a detailed visualization of individual neurons
in your network:

- Neurons are represented as circles organized in layers

- Connections between neurons show the network structure

- Input neurons are on the left, followed by hidden layers, and output
  neurons on the right

### Neuron Panel

When you click on a neuron, the Neuron Properties panel on the right
shows:

- Layer Information: Whether it\'s an input, hidden, or output neuron

- Weights: Connection strengths to neurons in the previous layer

- Bias: The neuron\'s bias value

- Activation Function: The function applied to the neuron\'s output

- Computation: The mathematical formula for the neuron\'s operation

Note: The weights and biases shown are placeholder values for
visualization purposes.

## Creating a Neural Network

To create a basic neural network:

1.  Start by adding an Input component to represent your data source

2.  Add layer components (like Linear) to process the data

3.  Add activation functions (like ReLU) after layers

4.  Add an Output component to represent the network\'s output

5.  Connect the components by drawing lines from outputs to inputs

6.  Select and configure each component through the Property Panel

7.  Use the different views to verify your network structure

Example - Simple Classification Network:

1.  Add MNIST Dataset or Input component

2.  Add a Linear Layer with appropriate input/output features

3.  Add a ReLU activation

4.  Add another Linear Layer for the output

5.  Add a LogSoftmax activation

6.  Add a CrossEntropyLoss for training

7.  Add an Optimizer (like Adam)

8.  Connect all components sequentially

9.  Configure parameters for each component

## Tips and Troubleshooting

- Connection Issues:

  - Connections can only be made from outputs (right side) to inputs
    (left side)

  - A component\'s input can only have one incoming connection

  - You cannot connect a component to itself

- Component Configuration:

  - Always click \"Apply Changes\" after modifying properties

  - Parameters must be valid (e.g., numeric values for dimensions)

- Network Validation:

  - The application may display warnings if your network structure is
    invalid

  - Multiple disconnected components will be treated as separate
    networks

- Exporting and Saving:

  - Use the Export button to download your model as a JSON file

  - Use the Save button to save your model to the server

## Test Results View

The Test Results view displays the training and evaluation performance
of the neural network you build after a test run.

#### What It Shows:

- Training Loss Curve: A red line graph showing how the loss decreases
  over each training epoch.

- Model Accuracy Curve: A blue line graph showing accuracy improvement
  across epochs.

- Final Metrics

  - Final Accuracy: The model's classification performance at the end of
    training.

  - Final Loss: The final loss value, used to assess model fit.

#### How It Works:

- This view is populated only after clicking the Run Test button in the
  top-right.

- It uses your model architecture from the Blocks view.

- Metrics are calculated using the defined dataset, loss function, and
  optimizer.

Use this view to evaluate:

- Whether your model is learning effectively.

- If it's underfitting or overfitting.

- The impact of architectural changes on performance

## Code Visualizer View

The Code Visualizer provides a real-time Python/PyTorch code
representation of the model you've built in the Blocks view.

#### What It Shows:

- Full PyTorch model class including:

  - \_\_init\_\_ with datasets, layers, loss function, and optimizer

  - forward() method with all layer operations

- Accurate translation of your block configurations (e.g., number of
  neurons, activations)

#### To allow for your preferences with the code visualization there are a few customization options:  {#to-allow-for-your-preferences-with-the-code-visualization-there-are-a-few-customization-options}

- Line Numbers: Select between viewing/not-viewing the number of lines
  of code.

- Change font size -- Dropdown menu with font size options.

- Theme -- Switch between light and dark themes.

- Library Docs -- Allows quick access to relevant documentation. (e.g.,
  PyTorch/torchvision APIs)  

#### How It Works:

- The code is automatically generated and updated as you modify the
  Blocks view.

- This ensures the source code exactly matches your current network
  design.

- This page allows for learning, debugging, or copying code for external
  projects.

## Header Buttons

|                         |                                                                                                                                               |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| **Button**              | **Purpose**                                                                                                                                   |
| **Sign in with Google** | Allows the users to Export and work on the desired models build on Google Services (Collab and saving the models on Drive)                    |
| **Save**                | Stores your current network (all blocks + their properties) to the backend to allow for Test Results and Code Visualization features to work. |
| **Export**              | Downloads your model as a .json file representing the entire Blocks layout and configuration.                                                 |
| **Run Test**            | Trains your visualized model (as defined in Blocks) and routes results to the Test Results tab                                                |
