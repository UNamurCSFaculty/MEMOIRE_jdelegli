package org.unamur.elderrings.app.media;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

@Path("/media/sounds")
public class SoundMediaEndpoint {

    @GET
    @Path("/{filename}")
    @Produces({"audio/mpeg", "audio/wav"})
    public Response getSound(@PathParam("filename") String filename) {
        var soundStream = SoundMediaEndpoint.class.getResourceAsStream("/sounds/" + filename);
        if (soundStream == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(soundStream).build();
    }
}