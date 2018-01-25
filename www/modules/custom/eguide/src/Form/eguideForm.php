<?php

namespace Drupal\eguide\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class eguideForm.
 */
class eguideForm extends FormBase {


  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'eguide_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $uid = \Drupal::currentUser()->id();
    $query = 0;

    $nid = \Drupal::database()->query("SELECT nfd.nid FROM node_field_data AS nfd
      LEFT JOIN node__field_user_id AS nfui ON nfui.entity_id = nfd.nid
      LEFT JOIN node__field_access_status AS nfas ON nfas.entity_id = nfd.nid
      WHERE nfui.field_user_id_target_id = " . $uid . " AND nfas.field_access_status_value = 'ok'")->fetchField();

    $form['user_id'] = [
      '#type' => 'hidden',
      '#default_value' => $uid,
    ];

    $check_python_running = exec("ps -e | grep python");
    if (!empty($check_python_running)) {
      $form['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Refresh page'),
        '#prefix' => '<h2>The system is busy. Please try again later.</h2>'
      ];
    }
    else if (!empty($nid)) {
      $form['nid'] = [
        '#type' => 'hidden',
        '#default_value' => $nid,
      ];
      $form['destination'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Destination'),
        '#description' => $this->t('Your destination'),
        '#maxlength' => 64,
        '#size' => 64,
        '#prefix' => "<center><div id='map_canvas'></div></center>",
      ];
      $form['submit'] = [
        '#type' => 'submit',
        '#title' => $this->t('Submit'),
      ];
      $form['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Submit'),
      ];
    }
    else {
      $form['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Insert Coin/Bill'),
      ];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $uid = $form_state->getValue('user_id');
    $username = \Drupal::database()->query("SELECT name FROM users_field_data WHERE uid = " . $uid)->fetchField();

    if ($form_state->getValue('op') == 'Insert Coin/Bill') {
      exec("python " . $_SERVER['DOCUMENT_ROOT'] . "/arduino_connect.py " . $username . " " . $uid);
    }
    else if ($form_state->getValue('op') == 'Submit') {
      
    }
  }

}
