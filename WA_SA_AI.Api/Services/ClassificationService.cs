using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.Models;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WA_SA_AI.Api.Services
{
    public class ClassificationService
    {
        public async Task<PredictionModel> PredictImage(Stream testImage)
        {
            string trainingKey = "6308b3b62b344e3f8e4170c4728deed2";
            string predictionKey = "afdffbaa498445c1830aa18ee9216e0b";

            // Create a prediction endpoint, passing in obtained prediction key
            PredictionEndpoint endpoint = new PredictionEndpoint() { ApiKey = predictionKey };

            TrainingApi trainingApi = new TrainingApi() { ApiKey = trainingKey };
            var projects = await trainingApi.GetProjectsAsync();
            var project = projects.First(f => f.Name == "WA-SE-AI");
            var result = endpoint.PredictImage(project.Id, testImage);

            // Loop over each prediction and write out the results
            foreach (var c in result.Predictions)
            {
                Console.WriteLine($"\t{c.TagName}: {c.Probability:P1}");
            }
            return result.Predictions.OrderByDescending(m => m.Probability).First();
        }
    }
}