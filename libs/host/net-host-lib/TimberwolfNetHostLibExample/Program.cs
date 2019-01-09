using System;
using TimberwolfNetHostLib;

namespace TimberwolfNetHostLibExample
{
    internal class Program
    {
        private static async System.Threading.Tasks.Task runAsync()
        {
            Console.WriteLine("Running...");

            ControllerHost host = await ControllerHost.getControllerHostAsync(ControllerHost.CommsType.Relay);

            Console.WriteLine("Host established");
            Console.WriteLine("Room Code: " + host.roomCode);

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
                Console.WriteLine("data received");
                Console.WriteLine(string.Join(", ", parts));
            });

            host.Connect();
        }

        private static void Main(string[] args)
        {
            runAsync();
            while (true) { }
        }
    }
}
