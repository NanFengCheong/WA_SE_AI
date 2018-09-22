using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Training.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;

namespace WA_SA_AI.Api.Services
{
    public class TrainService
    {
        private List<string> hemlockImages;
        private List<string> japaneseCherryImages;
        private MemoryStream testImage;

        public void Train(string tagName)
        {
            // Add your training & prediction key from the settings page of the portal
            string trainingKey = "6308b3b62b344e3f8e4170c4728deed2";

            // Create the Api, passing in the training key
            TrainingApi trainingApi = new TrainingApi() { ApiKey = trainingKey };
            var project = trainingApi.GetProjects().First(f => f.Name == "WA-SE-AI");

            // Make two tags in the new project
            Tag trainTag;

            try
            {
                trainTag = trainingApi.GetTags(project.Id).First(f => f.Name == tagName);
            }
            catch (Exception)
            {
                trainTag = trainingApi.CreateTag(project.Id, tagName);
            }

            // Add some images to the tags
            Console.WriteLine("Load image into memory");
            List<string> FilePathStringList = LoadImagesFromDisk(tagName);

            if (FilePathStringList != null)
            {
                Console.WriteLine("Uploading images");
                var hemlockImageFiles = hemlockImages.Select(img => new ImageFileCreateEntry(Path.GetFileName(img), File.ReadAllBytes(img))).ToList();
                trainingApi.CreateImagesFromFiles(project.Id, new ImageFileCreateBatch(hemlockImageFiles, new List<Guid>() { trainTag.Id }));

                // Now there are images with tags start training the project
                Console.WriteLine("\tTraining");
                var iteration = trainingApi.TrainProject(project.Id);

                // The returned iteration will be in progress, and can be queried periodically to see when it has completed
                while (iteration.Status == "Training")
                {
                    Thread.Sleep(1000);

                    // Re-query the iteration to get it's updated status
                    iteration = trainingApi.GetIteration(project.Id, iteration.Id);
                }

                // The iteration is now trained. Make it the default project endpoint
                iteration.IsDefault = true;
                trainingApi.UpdateIteration(project.Id, iteration.Id, iteration);
                Console.WriteLine("Training Done!\n");
            }
            else
            {
                Console.WriteLine("No image found!\n");
            }

        }

        private List<string> LoadImagesFromDisk(string TagName)
        {
            try
            {
                // this loads the images to be uploaded from disk into memory
                return Directory.GetFiles(Path.Combine("Images", TagName)).ToList();
            }
            catch (Exception)
            {

                return null;
            }
        }
    }
}
