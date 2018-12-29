using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimberwolfNetHostLib;

namespace TimberwolfNetHostLibExample
{
    class Program
    {
        static void Main(string[] args)
        {
            ControllerHost host = new ControllerHost("http://localhost:8081", "");
            host.connect();

            while(true) { } // Find better way to do this, need to keep the thread running to recieve comms
        }
    }
}
