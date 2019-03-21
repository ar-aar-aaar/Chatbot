package mx.com.axity.web.rest;

import io.swagger.annotations.Api;
import mx.com.axity.commons.to.ContactTO;
import mx.com.axity.commons.to.UserTO;
import mx.com.axity.model.ContactDO;
import mx.com.axity.services.facade.IbecaFacade;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*", allowCredentials = "true")
@RestController
@RequestMapping("contact")
@Api(value="beca", description="Operaciones con beca")
public class HelloController {

    static final Logger LOG = LogManager.getLogger(HelloController.class);

    //@Autowired
    //RestTemplate restTemplate;

    @Autowired
    IbecaFacade IbecaFacade;

    @RequestMapping(value = "/getContact", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity getContact(@RequestParam(value = "name")String name) {
        ContactTO contactTO = this.IbecaFacade.getContactF(name);
        return new ResponseEntity<>(contactTO,HttpStatus.OK);
    }

}
