using Microsoft.AspNetCore.Mvc;
using IonInnovationsApp.Models;
using IonInnovationsApp.Services;

namespace IonInnovationsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovementController : ControllerBase
    {
        private readonly ILogger<MovementController> _logger;
        private readonly IMovementService _movementService;

        public MovementController(ILogger<MovementController> logger, IMovementService movementService)
        {
            _logger = logger;
            _movementService = movementService;
        }

        /// <summary>
        /// Execute a movement command
        /// </summary>
        /// <param name="command">The movement command to execute</param>
        /// <returns>Backend response with movement ID and status</returns>
        [HttpPost("Command")]
        public async Task<ActionResult<BackendResponse>> ExecuteCommand([FromBody] MovementCommand command)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new BackendResponse
                    {
                        Success = false,
                        Message = "Invalid command format"
                    });
                }

                _logger.LogInformation($"Received movement command: Action={command.Action}, Axis={command.Axis}, Direction={command.Direction}, StepSize={command.StepSize}");

                // await Task.Delay(500);

                var response = await _movementService.ExecuteMovementCommand(command);
                
                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing movement command");
                return StatusCode(500, new BackendResponse
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get the status of a movement operation
        /// </summary>
        /// <param name="movementId">The ID of the movement to check</param>
        /// <returns>Movement status and current position</returns>
        [HttpGet("Status/{movementId}")]
        public async Task<ActionResult<MovementStatusResponse>> GetStatus(string movementId)
        {
            try
            {
                if (string.IsNullOrEmpty(movementId))
                {
                    return BadRequest(new MovementStatusResponse
                    {
                        Completed = true,
                        ErrorMessage = "Invalid movement ID"
                    });
                }

                _logger.LogInformation($"Checking status for movement: {movementId}");

                var status = await _movementService.GetMovementStatus(movementId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting movement status for {movementId}");
                return StatusCode(500, new MovementStatusResponse
                {
                    Completed = true,
                    ErrorMessage = $"Error checking status: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get the current position of the system
        /// </summary>
        /// <returns>Current X, Y, Z position</returns>
        [HttpGet("Position")]
        public ActionResult<CurrentPosition> GetCurrentPosition()
        {
            try
            {
                var position = _movementService.GetCurrentPosition();
                _logger.LogInformation($"Current position requested: X={position.X:F2}, Y={position.Y:F2}, Z={position.Z:F2}");
                return Ok(position);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current position");
                return StatusCode(500, new CurrentPosition { X = 0, Y = 0, Z = 0 });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        /// <returns>System status</returns>
        [HttpGet("Health")]
        public ActionResult<object> HealthCheck()
        {
            return Ok(new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Message = "Movement controller is operational"
            });
        }
    }
}