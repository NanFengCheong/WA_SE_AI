using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Vision.CustomVision.Prediction.Models;
using WA_SA_AI.Api.Services;

namespace WA_SA_AI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassificationController : ControllerBase
    {
        // GET: api/Classification
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Classification/5
        [HttpGet("{id}", Name = "Get")]
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Classification
        [HttpPost]
        [Route("PredictImage")]
        public async Task<PredictionModel> PredictImageAsync(IFormFile formFile)
        {
            var filePath = Path.GetTempFileName();

            if (formFile != null && formFile.Length > 0)
            {
                var stream = new FileStream(filePath, FileMode.Create);
                stream.Close();
                using (var memoryStream = new MemoryStream(System.IO.File.ReadAllBytes(filePath)))
                {
                    PredictionModel predictionModel = await new ClassificationService().PredictImage(memoryStream);
                    //do some processing
                    return predictionModel;
                }
            }
            else
            {
                throw new Exception("formFile not found or empty file");
            }

            //foreach (var formFile in files)
            //{
            //    if (formFile.Length > 0)
            //    {
            //        using (var stream = new FileStream(filePath, FileMode.Create))
            //        {
            //            await formFile.CopyToAsync(stream);
            //        }
            //    }
            //}
            ////var formFile = files.FirstOrDefault();

        }

        // PUT: api/Classification/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
