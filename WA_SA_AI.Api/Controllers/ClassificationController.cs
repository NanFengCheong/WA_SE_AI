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
        [Route("PredictImage")]
        public async Task<PredictionModel> PredictImageAsync(List<IFormFile> files)
        {
            long size = files.Sum(f => f.Length);

            // full path to file in temp location
            var filePath = Path.GetTempFileName();
            var formFile = files.FirstOrDefault();
            if (formFile != null && formFile.Length > 0)
            {
                using (var stream = new MemoryStream())
                {
                    await formFile.CopyToAsync(stream);
                    PredictionModel predictionModel = await new ClassificationService().PredictImage(stream);
                    //do some processing
                    return predictionModel;
                }
            }
            else
            {
                return null;
            }
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
