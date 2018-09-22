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
using WA_SA_AI.Api.Model;

namespace WA_SA_AI.Api.Services
{
    public class ClassificationService
    {
        public async Task<PredictImageResult> PredictImage(Stream testImage)
        {
            string trainingKey = "6308b3b62b344e3f8e4170c4728deed2";
            string predictionKey = "afdffbaa498445c1830aa18ee9216e0b";

            // Create a prediction endpoint, passing in obtained prediction key
            PredictionEndpoint endpoint = new PredictionEndpoint() { ApiKey = predictionKey };

            TrainingApi trainingApi = new TrainingApi() { ApiKey = trainingKey };
            var projects = await trainingApi.GetProjectsAsync();
            var project = projects.First(f => f.Name == "WA-SE-AI");
            try
            {
                var result = await endpoint.PredictImageAsync(project.Id, testImage);
                var tags = await trainingApi.GetTagsAsync(project.Id);
                // Loop over each prediction and write out the results
                foreach (var c in result.Predictions)
                {
                    Console.WriteLine($"\t{c.TagName}: {c.Probability:P1}");
                }
                var topPrediction = result.Predictions.OrderByDescending(m => m.Probability).First();
                PredictImageResult predictImageResult = new PredictImageResult
                {
                    PredictionModel = topPrediction,
                    Tag = tags.FirstOrDefault(f => f.Id == topPrediction.TagId)
                };
                return predictImageResult;
            }
            catch (Exception e)
            {
                throw new Exception("PredictImage failed");
            }
        }
    }
}