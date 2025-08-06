using IonInnovationsApp.Models;
using System.Collections.Concurrent;

namespace IonInnovationsApp.Services
{
    public interface IMovementService
    {
        Task<BackendResponse> ExecuteMovementCommand(MovementCommand command);
        Task<MovementStatusResponse> GetMovementStatus(string movementId);
        CurrentPosition GetCurrentPosition();
    }

    public class MovementService : IMovementService
    {
        private readonly ILogger<MovementService> _logger;
        private readonly ConcurrentDictionary<string, MovementOperation> _activeMovements;
        private CurrentPosition _currentPosition;
        private readonly Random _random;

        public MovementService(ILogger<MovementService> logger)
        {
            _logger = logger;
            _activeMovements = new ConcurrentDictionary<string, MovementOperation>();
            _currentPosition = new CurrentPosition { X = 0.0, Y = 0.0, Z = 0.0 };
            _random = new Random();
        }

        public async Task<BackendResponse> ExecuteMovementCommand(MovementCommand command)
        {
            try
            {
                _logger.LogInformation($"Executing movement command: {command.Action}");

                // Generate unique movement ID
                var movementId = $"mov_{DateTime.UtcNow.Ticks}_{Guid.NewGuid().ToString("N")[..8]}";

                // Calculate estimated duration based on command
                var estimatedDuration = CalculateEstimatedDuration(command);

                // Create movement operation
                var operation = new MovementOperation
                {
                    Id = movementId,
                    Command = command,
                    StartTime = DateTime.UtcNow,
                    IsCompleted = false
                };

                _activeMovements[movementId] = operation;

                // Start background task to simulate movement
                _ = Task.Run(async () => await SimulateMovement(operation));

                return new BackendResponse
                {
                    Success = true,
                    Message = $"Movement command accepted: {command.Action}",
                    MovementId = movementId,
                    CurrentPosition = _currentPosition,
                    EstimatedDuration = estimatedDuration
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing movement command");
                return new BackendResponse
                {
                    Success = false,
                    Message = $"Failed to execute movement: {ex.Message}"
                };
            }
        }

        public async Task<MovementStatusResponse> GetMovementStatus(string movementId)
        {
            if (!_activeMovements.TryGetValue(movementId, out var operation))
            {
                return new MovementStatusResponse
                {
                    Completed = true,
                    ErrorMessage = "Movement not found - assuming completed"
                };
            }

            return new MovementStatusResponse
            {
                Completed = operation.IsCompleted,
                Position = operation.IsCompleted ? operation.FinalPosition : _currentPosition,
                ErrorMessage = operation.ErrorMessage
            };
        }

        public CurrentPosition GetCurrentPosition()
        {
            return new CurrentPosition
            {
                X = _currentPosition.X,
                Y = _currentPosition.Y,
                Z = _currentPosition.Z
            };
        }

        private async Task SimulateMovement(MovementOperation operation)
        {
            try
            {
                var duration = CalculateEstimatedDuration(operation.Command);
                
                _logger.LogInformation($"Starting movement simulation for {operation.Id}, duration: {duration}ms");

                // Simulate movement time
                await Task.Delay(duration);

                // Update position based on command
                var newPosition = CalculateNewPosition(operation.Command);
                _currentPosition = newPosition;

                // Mark operation as completed
                operation.IsCompleted = true;
                operation.CompletionTime = DateTime.UtcNow;
                operation.FinalPosition = newPosition;

                _logger.LogInformation($"Movement {operation.Id} completed. New position: X={newPosition.X:F2}, Y={newPosition.Y:F2}, Z={newPosition.Z:F2}");

                // Clean up after 30 seconds
                _ = Task.Run(async () =>
                {
                    await Task.Delay(30000);
                    _activeMovements.TryRemove(operation.Id, out _);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during movement simulation for {operation.Id}");
                operation.IsCompleted = true;
                operation.ErrorMessage = ex.Message;
            }
        }

        private int CalculateEstimatedDuration(MovementCommand command)
        {
            return command.StepSize?.ToLower() switch
            {
                "large" => _random.Next(1000, 2000), // 1-2 seconds for large steps
                "small" => _random.Next(500, 1000),  // 0.5-1 second for small steps
                _ => command.Action?.ToLower() switch
                {
                    "home" => _random.Next(2000, 3000),      // 2-3 seconds for home
                    "autofocus" => _random.Next(1500, 2500), // 1.5-2.5 seconds for autofocus
                    "setposition" => _random.Next(1000, 2000), // 1-2 seconds for set position
                    _ => _random.Next(500, 1000)
                }
            };
        }

        private CurrentPosition CalculateNewPosition(MovementCommand command)
        {
            var newPosition = new CurrentPosition
            {
                X = _currentPosition.X,
                Y = _currentPosition.Y,
                Z = _currentPosition.Z
            };

            switch (command.Action?.ToLower())
            {
                case "move":
                    var stepSize = command.StepSize?.ToLower() == "large" ? 1.0 : 0.1;
                    var direction = command.Direction?.ToLower() == "positive" ? 1 : -1;
                    
                    switch (command.Axis?.ToUpper())
                    {
                        case "X":
                            newPosition.X += direction * stepSize + (_random.NextDouble() - 0.5) * 0.01;
                            break;
                        case "Y":
                            newPosition.Y += direction * stepSize + (_random.NextDouble() - 0.5) * 0.01;
                            break;
                        case "Z":
                            newPosition.Z += direction * (stepSize * 0.1) + (_random.NextDouble() - 0.5) * 0.001;
                            break;
                    }
                    break;

                case "setposition":
                    if (command.TargetPosition != null)
                    {
                        newPosition.X = command.TargetPosition.X ?? newPosition.X;
                        newPosition.Y = command.TargetPosition.Y ?? newPosition.Y;
                        newPosition.Z = command.TargetPosition.Z ?? newPosition.Z;
                    }
                    break;

                case "home":
                    newPosition.X = 0.0 + (_random.NextDouble() - 0.5) * 0.01;
                    newPosition.Y = 0.0 + (_random.NextDouble() - 0.5) * 0.01;
                    newPosition.Z = 0.0 + (_random.NextDouble() - 0.5) * 0.001;
                    break;

                case "autofocus":
                    // Autofocus might make small Z adjustments
                    newPosition.Z += (_random.NextDouble() - 0.5) * 0.05;
                    break;
            }

            return newPosition;
        }
    }
}