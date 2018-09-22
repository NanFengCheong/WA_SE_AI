using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        // GET: api/Train/5
        [HttpGet("{tagName}", Name = "Get")]
        public bool Get(string tagName, string description)
        {
            if (tagName != null || tagName != "")
            {
                return new TrainService().Train(tagName, description);
            }
            else
            {
                throw new Exception("Empty tagName");
            }
        }

        // POST: api/Train
        [HttpPost]
        public void Post([FromBody] string value)
        {
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
