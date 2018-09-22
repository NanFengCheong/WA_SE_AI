using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WA_SA_AI.Api.Model;
using WA_SA_AI.Api.Services;

namespace WA_SA_AI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainController : ControllerBase
    {
        // GET: api/Train
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // POST: api/Train
        [HttpPost]
        public bool Post([FromBody] TrainParam trainParam)
        {
            if (trainParam.TagName != null || trainParam.TagName != "")
            {
                return new TrainService().Train(trainParam.TagName, trainParam.Description);
            }
            else
            {
                throw new Exception("Empty tagName");
            }
        }

        // PUT: api/Train/5
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
