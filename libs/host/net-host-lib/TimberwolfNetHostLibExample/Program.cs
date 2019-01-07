using System;
using TimberwolfNetHostLib;

namespace TimberwolfNetHostLibExample
{
    internal class Program
    {
<<<<<<< HEAD
        private static async System.Threading.Tasks.Task runAsync()
        {
            Console.WriteLine("Running...");

            ControllerHost host = await ControllerHost.getControllerHostAsync(ControllerHost.CommsType.Relay);

            Console.WriteLine("Host established");
            Console.WriteLine("Room Code: " + host.roomCode);
=======
        private static void Main(string[] args)
        {
            int count = 0;

            Console.WriteLine("Game started with count=" + count);

            ControllerHost host = ControllerHost.getControllerHost(ControllerHost.CommsType.Relay, "http://localhost:8081", "");
>>>>>>> master

            host.AddEventListener(ControllerHost.EventType.ControllerConnected, (object[] parts) =>
            {
                Console.WriteLine("Controller connected");
            });

            host.AddEventListener(ControllerHost.EventType.ControllerDisconnected, (object[] parts) =>
            {
                Console.WriteLine("Controller disconencted");
            });

            host.AddEventListener(ControllerHost.EventType.Error, (object[] parts) =>
            {
                Console.Error.WriteLine(parts);
            });

            host.AddEventListener(ControllerHost.EventType.Input, (object[] parts) =>
            {
<<<<<<< HEAD
                Console.WriteLine("data received");
                Console.WriteLine(string.Join(", ", parts));
            });

            host.Connect();
        }

        private static void Main(string[] args)
        {
            runAsync();
            while (true) { }
=======
                Console.WriteLine("data received from " + parts[0]);
                Console.WriteLine("parts[1]: " + parts[1]);
                count = count + 1;
                Console.WriteLine("Count updated! count=" + count);
            });

            host.Connect();

            while (true) { } // Find better way to do this, need to keep the thread running to recieve comms
>>>>>>> master
        }
    }
}
