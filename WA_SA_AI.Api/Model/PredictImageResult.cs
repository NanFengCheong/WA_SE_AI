using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.Models;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WA_SA_AI.Api.Model
{
    public class PredictImageResult
    {
        public PredictionModel PredictionModel { get; set; }
        public Tag Tag { get; set; }
    }
}
