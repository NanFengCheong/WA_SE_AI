using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WA_SA_AI.Api.Model
{
    public class TrainParam
    {
        public string TagName { get; set; }
        public string RecycleableType { get; set; }
        public string BinName { get; set; }
        public string Description
        {
            get
            {
                return RecycleableType + "@" + BinName;
            }
        }
    }
}
