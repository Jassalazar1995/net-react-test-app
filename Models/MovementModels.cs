using System.ComponentModel.DataAnnotations;

namespace IonInnovationsApp.Models
{
    public class MovementCommand
    {
        [Required]
        public string Action { get; set; } = string.Empty;
        
        public string? Axis { get; set; } // X, Y, Z
        
        public string? Direction { get; set; } // positive, negative
        
        public string? StepSize { get; set; } // small, large
        
        public TargetPosition? TargetPosition { get; set; }
    }

    public class TargetPosition
    {
        public double? X { get; set; }
        public double? Y { get; set; }
        public double? Z { get; set; }
    }

    public class BackendResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? MovementId { get; set; }
        public CurrentPosition? CurrentPosition { get; set; }
        public int? EstimatedDuration { get; set; }
    }

    public class CurrentPosition
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }
    }

    public class MovementStatusResponse
    {
        public bool Completed { get; set; }
        public CurrentPosition? Position { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class MovementOperation
    {
        public string Id { get; set; } = string.Empty;
        public MovementCommand Command { get; set; } = new();
        public DateTime StartTime { get; set; }
        public DateTime? CompletionTime { get; set; }
        public bool IsCompleted { get; set; }
        public CurrentPosition? FinalPosition { get; set; }
        public string? ErrorMessage { get; set; }
    }
}